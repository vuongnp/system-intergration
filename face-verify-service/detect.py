import os
import onnxruntime as nxrun
import numpy as np
from numpy import dot
import cv2

ort_session_detect = nxrun.InferenceSession("models/face-detect.onnx")
detect_inname = ort_session_detect.get_inputs()[0].name

def process_img_detect(orig_image):
        image = cv2.cvtColor(orig_image, cv2.COLOR_BGR2RGB)
        image = cv2.resize(image, (640, 640))
        image_mean = np.array([127, 127, 127])
        image = (image - image_mean) / 128
        image = np.transpose(image, [2, 0, 1])
        image = np.expand_dims(image, axis=0)
        image = image.astype(np.float32)
        return image

def get_new_box(src_w, src_h, bbox, scale):
        x = bbox[0]
        y = bbox[1]
        box_w = bbox[2] - x
        box_h = bbox[3] - y

        scale = min((src_h-1)/box_h, min((src_w-1)/box_w, scale))

        new_width = box_w * scale
        new_height = box_h * scale
        center_x, center_y = box_w/2+x, box_h/2+y

        left_top_x = center_x-new_width/2
        left_top_y = center_y-new_height/2
        right_bottom_x = center_x+new_width/2
        right_bottom_y = center_y+new_height/2

        if left_top_x < 0:
            right_bottom_x -= left_top_x
            left_top_x = 0

        if left_top_y < 0:
            right_bottom_y -= left_top_y
            left_top_y = 0

        if right_bottom_x > src_w-1:
            left_top_x -= right_bottom_x-src_w+1
            right_bottom_x = src_w-1

        if right_bottom_y > src_h-1:
            left_top_y -= right_bottom_y-src_h+1
            right_bottom_y = src_h-1

        return int(left_top_x), int(left_top_y),\
               int(right_bottom_x), int(right_bottom_y)

def crop(org_img, bbox, scale, out_w, out_h, crop=True):
    if not crop:
        dst_img = cv2.resize(org_img, (out_w, out_h))
    else:
        src_h, src_w, _ = np.shape(org_img)
        left_top_x, left_top_y, \
                right_bottom_x, right_bottom_y = get_new_box(src_w, src_h, bbox, scale)

        img = org_img[left_top_y: right_bottom_y+1,left_top_x: right_bottom_x+1]
        dst_img = cv2.resize(img, (out_w, out_h))
    return dst_img

def box_iou(box1, box2):
        # (x1,y1,x2,y2) box1
        x11 = box1[0]
        y11 = box1[1]
        x12 = box1[2]
        y12 = box1[3]
        # (x1,y1,x2,y2) box2
        x21 = box2[0]
        y21 = box2[1]
        x22 = box2[2]
        y22 = box2[3]
        # area1
        area1 = (x12 - x11) * (y12 - y11)
        # area2
        area2 = (x22 - x21) * (y22 - y21)
        # intersection
        x1 = max(x11, x21)
        x2 = min(x12, x22)
        y1 = max(y11, y21)
        y2 = min(y12, y22)
        intersection = (x2 - x1) * (y2 - y1)
        iou = intersection / (area1 + area2 - intersection)
        return iou

def nms(width,height,scores,boxes,iou_threshold=0.5,conf_threshold=0.4):
        zipped=[]
        for i in range(len(scores)):
            if scores[i]>conf_threshold:
                zipped.append([scores[i],[boxes[i][0], boxes[i][1], boxes[i][2], boxes[i][3]]])
        zipped = sorted(zipped,key=lambda x: x[0], reverse=True)
        # print(zipped)
        selected=[]
        for box in zipped:
            toAdd = True
            for i in range(len(selected)):
                iou = box_iou(box[1],selected[i][1])
                if iou>iou_threshold:
                    toAdd=False
            if toAdd:
                selected.append(box)
        for item in selected:
            item[1][0] = int(item[1][0] * width)
            item[1][1] = int(item[1][1] * height)
            item[1][2] = int(item[1][2] * width)
            item[1][3] = int(item[1][3] * height)
        return selected

def process(img_path):
    img_raw = cv2.imread(img_path)
    image = process_img_detect(img_raw)
    confidences, boxes = ort_session_detect.run(None, {detect_inname: image})
    scores = confidences[0][:,1]
    boxes = boxes[0]
    dets = nms(img_raw.shape[1], img_raw.shape[0], scores, boxes)
    bboxes=[]
    for b in dets:
        bboxes.append(b[1])
    box = dets[0][1]
    crop_img = img_raw[(int(box[1])-50):(int(box[3])+50), (int(box[0])-50):(int(box[2])+50)]
    cv2.imwrite("test.jpg", crop_img)
    

if __name__ == '__main__':
    img_path = "/Users/awlvn/Documents/vuongnp/images/donghua/dauladailuc_holietna/5.jpeg"
    process(img_path)
