from flask import Flask, jsonify, request, session, redirect, url_for, send_file
from flask_cors import CORS, cross_origin
from flask_pymongo import pymongo
import os
import json
import onnxruntime as nxrun
from flask_socketio import SocketIO, emit, join_room
import numpy as np
from numpy import dot
from numpy.linalg import norm
import cv2
import base64

ort_session_detect = nxrun.InferenceSession("models/face-detect.onnx")
detect_inname = ort_session_detect.get_inputs()[0].name
ort_session_vectorize = nxrun.InferenceSession("models/mobilefacenet_vgg2.onnx")
vectorize_inname = [input.name for input in ort_session_vectorize.get_inputs()]
ort_session_anti = nxrun.InferenceSession("models/anti_MiniFANetV2.onnx")
anti_inname = [input.name for input in ort_session_anti.get_inputs()]
n, c, h, w = [1, 3, 128, 128]

app = Flask(__name__)
app.secret_key = 'vuongnp'
# CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
# socketio = SocketIO(app)
socketio = SocketIO(app, cors_allowed_origins="*")
# Set CORS options on app configuration
CORS(app, resources={r'/*': {'origins': [
    'http://localhost:8080', '*'  # React
      # React
  ]}}, supports_credentials=True)

client = pymongo.MongoClient("mongodb+srv://vuongnp:1234566@vuongcluster1.gl4g4.mongodb.net/myFirstDatabase?retryWrites=true&w=majority")
db = client.get_database("attendance")

def process_img_detect(orig_image):
        image = cv2.cvtColor(orig_image, cv2.COLOR_BGR2RGB)
        image = cv2.resize(image, (640, 640))
        image_mean = np.array([127, 127, 127])
        image = (image - image_mean) / 128
        image = np.transpose(image, [2, 0, 1])
        image = np.expand_dims(image, axis=0)
        image = image.astype(np.float32)
        return image

def precess_img_vectorize(img):
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = np.float32(img)
    img = cv2.resize(img, (w, h))
    img = img.transpose((2, 0, 1))  # Change data layout from HWC to CHW
    img = np.expand_dims(img, axis=0)
    img = img/255.0
    return img

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

def process_img_anti(image, bbox):
    img = crop(image, bbox, 2.7, 80, 80, True)
    img = np.float32(img)
    img = img.transpose((2, 0, 1))
    img = np.expand_dims(img, axis=0)
    return img

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

def process_detect_vectorize(img_raw):
    image = process_img_detect(img_raw)
    confidences, boxes = ort_session_detect.run(None, {detect_inname: image})
    scores = confidences[0][:,1]
    boxes = boxes[0]
    dets = nms(img_raw.shape[1], img_raw.shape[0], scores, boxes)
    print('dets', dets)
    if not dets:
        return {'code':0, 'message': 'non-face', 'dets': []}
    elif len(dets)>1:
        bboxes=[]
        for b in dets:
            bboxes.append(b[1])
        return {'code':2, 'message':'many-face','dets': bboxes}
    else:
        bboxes=[]
        for b in dets:
            bboxes.append(b[1])
        box = dets[0][1]
        crop_img = img_raw[(int(box[1])):(int(box[3])), (int(box[0])):(int(box[2]))]
        crop_img = precess_img_vectorize(crop_img)
        # crop_img = precess_img_vec(crop_img)
        res = ort_session_vectorize.run(None, {vectorize_inname[0]: crop_img})
        res = res[0].transpose()[0][0]
        embedding = res.reshape(1,256)[0]
        embedding = [float(i) for i in list(embedding)]
        return {'code':1, 'dets': bboxes, 'embedding': embedding}

def process_detect_anti_vectorize(img_raw):
    image = process_img_detect(img_raw)
    confidences, boxes = ort_session_detect.run(None, {detect_inname: image})
    scores = confidences[0][:,1]
    boxes = boxes[0]
    dets = nms(img_raw.shape[1], img_raw.shape[0], scores, boxes)
    print('dets', dets)
    if not dets:
        return {'code':0, 'message': 'non-face', 'dets': []}
    elif len(dets)>1:
        bboxes=[]
        for b in dets:
            bboxes.append(b[1])
        return {'code':2, 'message':'many-face','dets': bboxes}
    else:
        bboxes=[]
        for b in dets:
            bboxes.append(b[1])
        box = dets[0][1]
        img_anti = process_img_anti(img_raw, box)
        res_anti = ort_session_anti.run(None, {anti_inname[0]: img_anti})
        label = np.argmax(res_anti[0][0])
        if label==1:
            crop_img = img_raw[(int(box[1])):(int(box[3])), (int(box[0])):(int(box[2]))]
            crop_img = precess_img_vectorize(crop_img)
            # crop_img = precess_img_vec(crop_img)
            res = ort_session_vectorize.run(None, {vectorize_inname[0]: crop_img})
            res = res[0].transpose()[0][0]
            embedding = res.reshape(1,256)[0]
            embedding = [float(i) for i in list(embedding)]
            return {'code':1, 'dets': bboxes, 'embedding': embedding}
        else:
            return {'code':10, 'dets': bboxes, 'message': 'fake face'}

@app.route("/get_embedding/<username>")
def get_embedding(username):
    vector_collection = pymongo.collection.Collection(db, "vector")
    user = vector_collection.find_one(filter={'username': username})
    if user:
        return {'code': '200','embedding':user['embedding']}
    else:
        return {'code': '404'}

@app.route("/verify", methods=['GET','POST'])
def verify():
    data = request.json
    username = data['username']
    embedding = data['embedding']
    img = data['img']
    # imgstring = None
    # with open("/home/vuongnp/Pictures/avatar.jpg", "rb") as image_file:
    #     imgstring = base64.b64encode(image_file.read())
    img = base64.b64decode(img)
    npimg = np.fromstring(img, dtype=np.uint8)
    img_raw = cv2.imdecode(npimg, 1)
    result_emb = process_detect_anti_vectorize(img_raw)
    if result_emb['code']!=1:
        return result_emb
    else:
        res = (result_emb['embedding'])
        # res1 = get_embedding("/home/vuongnp/Documents/inference_onnx/database/Vuong.jpg")
        embedding = get_embedding(username)['embedding']
        cos_sim = dot(embedding, res)/(norm(embedding)*norm(res))
        # print("Similarity: ",cos_sim)
        return {'code':1, 'dets': result_emb['dets'], 'similarity': float(cos_sim)}

@app.route("/changedbvector", methods=['POST'])
def changedbvector():
    username = request.form["username"]
    filestr = request.files['file'].read()
    # print(username, filestr)
    #convert string data to numpy array
    npimg = np.fromstring(filestr, np.uint8)
    # convert numpy array to image
    img_raw = cv2.imdecode(npimg, 1)
    # print(img_raw)
    # print(img_raw.shape)
    result_emb = process_detect_vectorize(img_raw)
    if result_emb['code']!=1:
        return result_emb
    else:
        # print(result_emb)      
        vector_collection = pymongo.collection.Collection(db, "vector")
        user = vector_collection.find_one(filter={'username': username})
        embedding = (result_emb['embedding'])
        if user:
            # print(user)
            vector_collection.find_one_and_update(filter={'username': username},
                                                update={'$set': {'embedding': embedding}})
        else:
            vector_collection.insert_one({
                'username': username,
                'embedding': embedding
            })
        return {'code':1, 'embedding': embedding}

@app.route("/log_attendance", methods=['POST'])
def log_attendance():
    data = request.json
    print(data)
    username = data['username']
    room_id = data['room_id']
    timestamp = data['timestamp']
    item = {
        'username': username,
        'timestamp': timestamp
    }     
    log_collection = pymongo.collection.Collection(db, "log")
    room = log_collection.find_one(filter={'room_id': room_id})
    if room:
        users = room['users']
        if users:
            users = users + [item]
        else:
            users = [item]
        log_collection.find_one_and_update(filter={'room_id': room_id},
                                                update={'$set': {'users': users}})
    else:
        log_collection.insert_one({
                'room_id': room_id,
                'users': [item]
        })
    return {'code': 200}

@app.route("/get_log_attendance/<room_id>")
def get_log_attendance(room_id):
    log_collection = pymongo.collection.Collection(db, "log")
    room = log_collection.find_one(filter={'room_id': room_id})
    users = room['users']
    newlist = sorted(users, key=lambda x: x['timestamp'], reverse=True)
    return {'data': newlist}

if __name__ == '__main__':
    # Threaded option to enable multiple instances for multiple user access support
    # app.run(threaded=True, port=5000)
    socketio.run(app=app,debug=True,port=5050)
    # socketio.run(app)
