from flask import Flask, request, jsonify, session
from flask_session import Session
from flask_bcrypt import Bcrypt
from flask_cors import CORS, cross_origin
import json
from pymongo import MongoClient
from bson.json_util import dumps
from bson import json_util
from bson.objectid import ObjectId
from datetime import datetime, timedelta

from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
CORS(app, resources={r"/*": {"origins": "*"}})
# CORS(app)
socketio = SocketIO(app,cors_allowed_origins="*")

socketio = SocketIO(app, cors_allowed_origins='http://localhost:3000')

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('send_message')
def handle_send_message(data):
    # Broadcast to all users
    emit('receive_message', data, broadcast=True)

bcrypt = Bcrypt(app) 

@app.route('/')
def index():
    return "success!"

# Set up MongoDB connection and collection 
client = MongoClient('mongodb://dev:XhD%26rCrDAM%2BOPaeXcjUmae%21%2BM@139.180.134.61:27017/admin') 

# Create utraffic_voh database if it doesn't exist already 
db = client['utraffic_voh'] 

# Create accounts and news collections if they don't exist already
accounts = db['user']
news = db['record']
addresses = db['address']
sharers = db['person_sharing']
reasons = db['reason']
traffic_state = db['speed']

@app.route('/api/authenticate', methods=['POST'])
def authenticate():
    _account = request.json
    print(_account)
    account = accounts.find_one(
        {
            "username": _account['username']
        })
    
    if (account == None):
        return "Tên đăng nhập không hợp lệ!!!", 404
    elif not bcrypt.check_password_hash(account['password'], _account['password']):
        return "Sai mật khẩu", 404
        
    acc = {
        "id": str(account['_id']),
        "name": account['name'],
        "role": account['role']
    }
    return acc

@app.route('/api/permission/<userId>', methods=['POST'])
def getPermission(userId : str):
    account = accounts.find_one(
        {
			"_id": ObjectId(userId)
		})
    
    if (account == None):
        return "none", 404
    
    if (account['role'] == 'ROLE_ADMIN'):
        return 'admin'
    elif (account['role'] == 'ROLE_MC'):
        return 'mc'
    elif (account['role'] == 'ROLE_DATAENTRY'):
        return 'thuky'
    elif (account['role'] == 'ROLE_DATAENTRY_EDITOR'):
        return 'thukyBTV'
    elif (account['role'] == 'ROLE_EDITOR'):
        return 'btv'
    return 'none'

@app.route('/api/changepassword/<userId>', methods=['POST'])
def changepassword(userId : str):
    # print(userId)
    account = accounts.find_one(
        {
			"_id": ObjectId(userId)
		})
    if (account == None):
        return "none", 404

    _account = request.json
    if not bcrypt.check_password_hash(account['password'], _account['oldpassword']):
        return "Sai mật khẩu", 404
    
    hashed_password = bcrypt.generate_password_hash(_account['newpassword']).decode('utf-8') 
    accounts.update_one(
        {
            "_id" : ObjectId(userId)
        },
        {
            "$set": {
                "password" : hashed_password,
            }
        }
    )
    return "Đổi mật khẩu thành công!!!", 200

@app.route('/api/deleteaccount/<userId>', methods=['POST'])
def deleteAccounts(userId : str):
    permission = getPermission(userId)
    if (permission != "admin"):
        return "Tài khoản không phải admin", 404
    
    _accounts = request.json
    
    for accountId in _accounts:
        accounts.delete_one(
            {
                "_id" : ObjectId(accountId)
            }   
        )

    return "Account đã được xóa", 200

@app.route('/api/resetpassword/<userId>', methods=['POST'])
def resetpassword(userId : str):
    permission = getPermission(userId)
    if (permission != "admin"):
        return "Tài khoản không phải admin", 404
    
    _accounts = request.json
    for accountId in _accounts:
        password = '123456789'
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        accounts.update_one(
            {
                "_id" : ObjectId(accountId)
            },
            {
                "$set": {
                    "password" : hashed_password,
                }
            }
        )

    return "Reset password thành công", 200

@app.route('/api/addaccount/<userId>', methods=['POST'])
def addAccount(userId : str):
    permission = getPermission(userId)
    if (permission != "admin"):
        return "Tài khoản không phải admin", 404
    
    _account = request.json
    
    password = '123456789'
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8') 
    _account.update({'password' : hashed_password})
    
    datetime_now = datetime.now()
    _account.update({'created_on' : datetime_now})
    
    if _account['role'] == 'MC':
        _account.update({'role' : 'ROLE_MC'})
    elif _account['role'] == 'Admin':
        _account.update({'role' : 'ROLE_ADMIN'})
    elif _account['role'] == 'Thư ký':
        _account.update({'role' : 'ROLE_DATAENTRY'})
    elif _account['role'] == 'Thư ký kiêm biên tập viên':
        _account.update({'role' : 'ROLE_DATAENTRY_EDITOR'})
    elif _account['role'] == 'Biên tập viên':
        _account.update({'role' : 'ROLE_EDITOR'})

    accountId =  accounts.insert_one(_account).inserted_id
    pipeline = [
        {
            '$match': {
                '_id': accountId
            }
        },
        {
            '$project': {
                '_id': 1,
                'username': 1,
                'name': 1,
                'phone_number': 1,
                'role': {
                    '$cond': {
                        'if': {'$eq': ['$role', 'ROLE_MC']},
                        'then': 'MC',
                        'else': {
                            '$cond': {
                                'if': {'$eq': ['$role', 'ROLE_ADMIN']},
                                'then': 'Admin',
                                'else': {
                                    '$cond': {
                                        'if': {'$eq': ['$role', 'ROLE_DATAENTRY']},
                                        'then': 'Thư ký',
                                        'else': {
                                            '$cond': {
                                                'if': {'$eq': ['$role', 'ROLE_DATAENTRY_EDITOR']},
                                                'then': 'Thư ký kiêm biên tập viên',
                                                'else': {
                                                    '$cond': {
                                                        'if': {'$eq': ['$role', 'ROLE_EDITOR']},
                                                        'then': 'Biên tập viên',
                                                        'else': '$role'
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                'created_on': {
                    '$cond': {
                        'if': {'$eq': [{'$type': '$created_on'}, 'date']},
                        'then': {
                            '$dateToString': {
                                'date': '$created_on',
                                'format': '%Y-%m-%d %H:%M:%S'
                            }
                        },
                        'else': '$created_on'
                    }
                }
            }
        }
    ]
    
    listCursor = list(accounts.aggregate(pipeline))

    jsonData = dumps(listCursor, ensure_ascii=False).encode('utf8')
    
    return jsonData

@app.route('/api/updateaccount/<userId>', methods=['POST'])
def updateAccount(userId : str):
    permission = getPermission(userId)
    if (permission != "admin"):
        return "Tài khoản không phải admin", 404
    
    _account = request.json
    if _account['role'] == 'MC':
        _account.update({'role' : 'ROLE_MC'})
    elif _account['role'] == 'Admin':
        _account.update({'role' : 'ROLE_ADMIN'})
    elif _account['role'] == 'Thư ký':
        _account.update({'role' : 'ROLE_DATAENTRY'})
    elif _account['role'] == 'Thư ký kiêm biên tập viên':
        _account.update({'role' : 'ROLE_DATAENTRY_EDITOR'})
    elif _account['role'] == 'Biên tập viên':
        _account.update({'role' : 'ROLE_EDITOR'})

    accountId = _account['_id']['$oid']

    accounts.update_one(
        {
            "_id" : ObjectId(accountId)
        },
        {
            "$set": {
                "name" : _account['name'],
                "phone_number" : _account['phone_number'],
                "role":  _account['role'],
            }
        }
    )
    return "Update account thành công", 200

@app.route('/api/admin/accounts/<userId>', methods=['GET'])
def getAccounts(userId : str):
    permission = getPermission(userId)
    if (permission == "none"):
        return "Tài khoản không tồn tại", 404
    
    pipeline = [
        {
            '$sort': {
                'created_on': -1
            }
        },
        {
            '$project': {
                '_id': 1,
                'username': 1,
                'name': 1,
                'phone_number': 1,
                'role': {
                    '$cond': {
                        'if': {'$eq': ['$role', 'ROLE_MC']},
                        'then': 'MC',
                        'else': {
                            '$cond': {
                                'if': {'$eq': ['$role', 'ROLE_ADMIN']},
                                'then': 'Admin',
                                'else': {
                                    '$cond': {
                                        'if': {'$eq': ['$role', 'ROLE_DATAENTRY']},
                                        'then': 'Thư ký',
                                        'else': {
                                            '$cond': {
                                                'if': {'$eq': ['$role', 'ROLE_DATAENTRY_EDITOR']},
                                                'then': 'Thư ký kiêm biên tập viên',
                                                'else': {
                                                    '$cond': {
                                                        'if': {'$eq': ['$role', 'ROLE_EDITOR']},
                                                        'then': 'Biên tập viên',
                                                        'else': '$role'
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                'created_on': {
                    '$cond': {
                        'if': {'$eq': [{'$type': '$created_on'}, 'date']},
                        'then': {
                            '$dateToString': {
                                'date': '$created_on',
                                'format': '%Y-%m-%d %H:%M:%S'
                            }
                        },
                        'else': '$created_on'
                    }
                }
            }
        }
    ]
    
    listCursor = list(accounts.aggregate(pipeline))
    # print(listCursor)

    jsonData = dumps(listCursor, ensure_ascii=False).encode('utf8')
    
    return jsonData

@app.route('/api/ctv/<userId>', methods=['GET'])
def getCTV(userId : str):
    permission = getPermission(userId)
    if (permission == "none"):
        return "Tài khoản không tồn tại", 404
    
    pipeline = [
        {
            '$project': {
                'value': {'$toString': '$_id'},
                'label': {'$concat': [{"$ifNull": [ '$name', ""]}, ' ', { "$ifNull": [ '$phone_number', "" ] }]},
                'name': 1,
                'phone_number': 1,
                'created_on':  {
                    '$cond': {
                        'if': {'$eq': [{'$type': '$created_on'}, 'date']},
                        'then': {
                            '$dateToString': {
                                'date': '$created_on',
                                'format': '%Y-%m-%d %H:%M:%S'
                            }
                        },
                        'else': '$created_on'
                    }
                }
            }
        }
    ]
    
    listCursor = list(sharers.aggregate(pipeline))

    jsonData = dumps(listCursor, ensure_ascii=False).encode('utf8')
    
    return jsonData

@app.route('/api/address/<userId>', methods=['GET'])
def getAddress(userId : str):
    permission = getPermission(userId)
    if (permission == "none"):
        return "Tài khoản không tồn tại", 404
    pipeline = [
        {
            '$project': {
                'value': {'$toString': '$_id'},
                'label': {
                    '$concat': [
                        {'$ifNull': ['$name', '']}, 
                        {'$ifNull': [{'$concat': [' tới ', '$direction']}, '']},
                        {'$ifNull': [
                            { '$concat': [ ' tại ', {'$cond': {
                                'if': {'$isArray': '$district'},
                                'then': {'$reduce': {
                                    'input': '$district',
                                    'initialValue': '',
                                    'in': {'$concat': ['$$value', ' ', {'$toString': '$$this'}]}
                                }},
                                'else': {'$toString': '$district'}
                            }}]},
                            ''
                        ]},
                    ]
                },
                'name': 1,
                'direction': { "$ifNull": [ '$direction', None ] },
                'district': { "$ifNull": [ '$district', None ] },
                'districtString': {'$cond': {
                                    'if': {'$isArray': '$district'},
                                    'then': {'$reduce': {
                                        'input': '$district',
                                        'initialValue': '',
                                        'in': {'$concat': ['$$value', ' ', {'$toString': '$$this'}]}
                                    }},
                                    'else': {'$toString': '$district'}
                                }},
                'created_on':  {
                    '$cond': {
                        'if': {'$eq': [{'$type': '$created_on'}, 'date']},
                        'then': {
                            '$dateToString': {
                                'date': '$created_on',
                                'format': '%Y-%m-%d %H:%M:%S'
                            }
                        },
                        'else': '$created_on'
                    }
                }
            }
        }
    ]
    
    listCursor = list(addresses.aggregate(pipeline))

    jsonData = dumps(listCursor, ensure_ascii=False).encode('utf8')
    
    return jsonData

@app.route('/api/speed/<userId>', methods=['GET'])
def getSpeed(userId : str):
    permission = getPermission(userId)
    if (permission == "none"):
        return "Tài khoản không tồn tại", 404
    
    pipeline = [
        {
            '$project': {
                'value': {'$toString': '$_id'},
                'label': {
                    '$concat': [ '$name',' - vận tốc: ', {'$toString': '$value'}]
                },
                'name': 1,
                'value': 1,
            }
        }
    ]
    
    listCursor = list(traffic_state.aggregate(pipeline))

    jsonData = dumps(listCursor, ensure_ascii=False).encode('utf8')
    
    return jsonData

@app.route('/api/reasons/<userId>', methods=['GET'])
def getReason(userId : str):
    permission = getPermission(userId)
    if (permission == "none"):
        return "Tài khoản không tồn tại", 404
    
    pipeline = [
        {
            '$project': {
                'value': {'$toString': '$_id'},
                'label': '$name',
                'created_on':  {
                    '$cond': {
                        'if': {'$eq': [{'$type': '$created_on'}, 'date']},
                        'then': {
                            '$dateToString': {
                                'date': '$created_on',
                                'format': '%Y-%m-%d %H:%M:%S'
                            }
                        },
                        'else': '$created_on'
                    }
                }
            }
        }
    ]
    
    listCursor = list(reasons.aggregate(pipeline))
    # print(listCursor)

    jsonData = dumps(listCursor, ensure_ascii=False).encode('utf8')
    
    return jsonData

@app.route('/api/getnews/<userId>', methods=['POST'])
def getNews(userId : str):
    permission = getPermission(userId)
    if (permission == "none"):
        return "Tài khoản không tồn tại", 404

    permission = getPermission(userId)
    if (permission == "none"):
        return "Tài khoản không tồn tại", 404

    pipeline = [
        {
            '$sort': {
                'created_on': -1
            }
        },
        {
            '$lookup': {
                'from': 'person_sharing',
                'localField': 'personSharing.$id',
                'foreignField': '_id',
                'as': 'person_sharing_info'
            }
        },
        {
            '$lookup': {
                'from': 'address',
                'localField': 'address.$id',
                'foreignField': '_id',
                'as': 'address_info'
            }
        },
        {
            '$lookup': {
                'from': 'speed',
                'localField': 'speed.$id',
                'foreignField': '_id',
                'as': 'speed_info'
            }
        },
        {
            '$lookup': {
                'from': 'reason',
                'localField': 'reason.$id',
                'foreignField': '_id',
                'as': 'reason_info'
            }
        },
        {
            '$unwind': '$person_sharing_info'
        },
        {
            '$unwind': '$address_info'
        },
        {
            '$unwind': '$speed_info'
        },
        {
            '$unwind': '$reason_info'
        },
        {
            '$project': {
                '_id': 1,
                'concatctv': {'$concat': [{"$ifNull": [ '$person_sharing_info.name', ""]}, ' ', { "$ifNull": [ '$person_sharing_info.phone_number', "" ] }]},
                'ctv': '$person_sharing_info.name',
                'ctv_phone': '$person_sharing_info.phone_number',
                'concatlocation': {
                    '$concat': [
                        {'$ifNull': ['$address_info.name', '']}, 
                        {'$ifNull': [{'$concat': [' tới ', '$address_info.direction']}, '']},
                        {'$ifNull': [
                            { '$concat': [ ' tại ', {'$cond': {
                                'if': {'$isArray': '$address_info.district'},
                                'then': {'$reduce': {
                                    'input': '$address_info.district',
                                    'initialValue': '',
                                    'in': {'$concat': ['$$value', ' ', {'$toString': '$$this'}]}
                                }},
                                'else': {'$toString': '$address_info.district'}
                            }}]},
                            ''
                        ]},
                    ]
                },
                'location': '$address_info.name',
                'district': '$address_info.district',
                'concatdistrict': {'$cond': {
                                'if': {'$isArray': '$address_info.district'},
                                'then': {'$reduce': {
                                    'input': '$address_info.district',
                                    'initialValue': '',
                                    'in': {'$concat': ['$$value', ' ', {'$toString': '$$this'}]}
                                }},
                                'else': {'$toString': '$address_info.district'}
                            }},
                'direction': '$address_info.direction',
                'state': {
                    '$concat': [
                        {'$ifNull': ['$speed_info.name', '']}, 
                        {'$ifNull': [{'$concat': [ ' ', {'$toString': '$speed_info.value'}, ' km/h']}, '']},
                    ]
                },
                # 'state': '$speed_info.name',
                # 'speed': '$speed_info.value',
                'reason': '$reason_info.name',
                'distance': 1,
                'notice': 1,
                'status': 1,
                # 'created_on': {
                #     '$cond': {
                #         'if': {'$eq': [{'$type': '$created_on'}, 'date']},
                #         'then': {
                #             '$dateToString': {
                #                 'date': '$created_on',
                #                 # 'format': '%Y-%m-%d %H:%M:%S'  # Adjust the format as needed
                #                 'format': '%Y-%m-%d'  # Adjust the format as needed
                #             }
                #         },
                #         'else': '$created_on'
                #     }
                # }
                'created_on': {
                    '$cond': {
                        'if': {'$eq': [{'$type': '$created_on'}, 'date']},
                        'then': {'$dateToString': {'date': '$created_on', 'format': '%Y-%m-%d'}},
                        'else': {'$substr': ['$created_on', 0, 10]}
                    }
                }
            }
        }
    ]

    if request.json != None:
        date_range = request.json
        
        start_date = datetime.strptime(date_range[0], '%Y-%m-%d')
        end_date = datetime.strptime(date_range[1], '%Y-%m-%d') + timedelta(days=1)

        pipeline.insert(0, {
            '$match': {
                '$or': [
                    {'created_on': {'$gte': start_date, '$lte': end_date}},
                    {'created_on': {'$gte': start_date.strftime('%Y-%m-%d %H:%M:%S'), '$lte': end_date.strftime('%Y-%m-%d %H:%M:%S')}}
                ]
            }
        })

    listCursor = list(news.aggregate(pipeline))
    
    jsonData = dumps(listCursor, ensure_ascii=False).encode('utf8')
    
    return jsonData

@app.route('/api/addnews/<userId>', methods=['POST'])
def addNews(userId : str):
    permission = getPermission(userId)
    if (permission == "mc"):
        return "Tài khoản này không thể thêm tin!!!", 403
    
    if (permission == "none"):
        return "Tài khoản không tồn tại", 404
    
    startStatus = 'Chờ đọc'

    # if (permission == "thuky"):
    #     startStatus = 'Chờ duyệt'
     
    datetime_now = datetime.now()
    _news = request.json
    _news.update({'created_on' : datetime_now})
    _news.update({'status' : startStatus})
    _news.update({'distance' : 100})

    _news['personSharing'] =  internaladdCTV(_news['personSharing'], _news['phone_number'])

    _news['address'] = internaladdAddress(_news['address'], _news['direction'], _news['district'])
    
    _news['reason'] = internaladdReason(_news['reason'])

    speed = traffic_state.find_one({'name': _news['state']})
    _news['speed'] = {
        '$ref': "speed",
        '$id': ObjectId(speed['_id'])
    }

    del _news['phone_number']
    del _news['district']
    del _news['state']
    del _news['direction']

    newsId =  news.insert_one(_news).inserted_id
    pipeline = [
        {
            '$match': {
                '_id': ObjectId(newsId)
            }
        },
        {
            '$lookup': {
                'from': 'person_sharing',
                'localField': 'personSharing.$id',
                'foreignField': '_id',
                'as': 'person_sharing_info'
            }
        },
        {
            '$lookup': {
                'from': 'address',
                'localField': 'address.$id',
                'foreignField': '_id',
                'as': 'address_info'
            }
        },
        {
            '$lookup': {
                'from': 'speed',
                'localField': 'speed.$id',
                'foreignField': '_id',
                'as': 'speed_info'
            }
        },
        {
            '$lookup': {
                'from': 'reason',
                'localField': 'reason.$id',
                'foreignField': '_id',
                'as': 'reason_info'
            }
        },
        {
            '$unwind': '$person_sharing_info'
        },
        {
            '$unwind': '$address_info'
        },
        {
            '$unwind': '$speed_info'
        },
        {
            '$unwind': '$reason_info'
        },
        {
            '$project': {
                '_id': 1,
                'concatctv': {'$concat': [{"$ifNull": [ '$person_sharing_info.name', ""]}, ' ', { "$ifNull": [ '$person_sharing_info.phone_number', "" ] }]},
                'ctv': '$person_sharing_info.name',
                'ctv_phone': '$person_sharing_info.phone_number',
                'concatlocation': {
                    '$concat': [
                        {'$ifNull': ['$address_info.name', '']}, 
                        {'$ifNull': [{'$concat': [' tới ', '$address_info.direction']}, '']},
                        {'$ifNull': [
                            { '$concat': [ ' tại ', {'$cond': {
                                'if': {'$isArray': '$address_info.district'},
                                'then': {'$reduce': {
                                    'input': '$address_info.district',
                                    'initialValue': '',
                                    'in': {'$concat': ['$$value', ' ', {'$toString': '$$this'}]}
                                }},
                                'else': {'$toString': '$address_info.district'}
                            }}]},
                            ''
                        ]},
                    ]
                },
                'location': '$address_info.name',
                'district': '$address_info.district',
                'concatdistrict': {'$cond': {
                                'if': {'$isArray': '$address_info.district'},
                                'then': {'$reduce': {
                                    'input': '$address_info.district',
                                    'initialValue': '',
                                    'in': {'$concat': ['$$value', ' ', {'$toString': '$$this'}]}
                                }},
                                'else': {'$toString': '$address_info.district'}
                            }},
                'direction': '$address_info.direction',
                'state': {
                    '$concat': [
                        {'$ifNull': ['$speed_info.name', '']}, 
                        {'$ifNull': [{'$concat': [ ' ', {'$toString': '$speed_info.value'}, ' km/h']}, '']},
                    ]
                },
                # 'state': '$speed_info.name',
                # 'speed': '$speed_info.value',
                'reason': '$reason_info.name',
                'distance': 1,
                'notice': 1,
                'status': 1,
                # 'created_on': {
                #     '$cond': {
                #         'if': {'$eq': [{'$type': '$created_on'}, 'date']},
                #         'then': {
                #             '$dateToString': {
                #                 'date': '$created_on',
                #                 # 'format': '%Y-%m-%d %H:%M:%S'  # Adjust the format as needed
                #                 'format': '%Y-%m-%d'  # Adjust the format as needed
                #             }
                #         },
                #         'else': '$created_on'
                #     }
                # }
                'created_on': {
                    '$cond': {
                        'if': {'$eq': [{'$type': '$created_on'}, 'date']},
                        'then': {'$dateToString': {'date': '$created_on', 'format': '%Y-%m-%d'}},
                        'else': {'$substr': ['$created_on', 0, 10]}
                    }
                }
            }
        }
    ]

    listCursor = list(news.aggregate(pipeline))
    
    jsonData = dumps(listCursor, ensure_ascii=False).encode('utf8')
    jsonData_str = jsonData.decode('utf8')
    json_obj = json.loads(jsonData_str)

    socketio.emit('add_news', json_obj)
    return jsonData

@app.route('/api/addctv/<userId>', methods=['POST'])
def addCTV(userId : str):
    permission = getPermission(userId)
    if (permission != "admin"):
        return "Tài khoản không phải admin", 404
    
    _ctv = request.json
    ctvObj = internaladdCTV(_ctv['name'], _ctv['phone_number'])

    pipeline = [
        {
            '$match': {
                '_id': ctvObj['$id']
            }
        },
        {
            '$project': {
                '_id': 1,
                'name': 1,
                'phone_number': 1,
                'created_on': {
                    '$cond': {
                        'if': {'$eq': [{'$type': '$created_on'}, 'date']},
                        'then': {
                            '$dateToString': {
                                'date': '$created_on',
                                'format': '%Y-%m-%d %H:%M:%S'
                            }
                        },
                        'else': '$created_on'
                    }
                }
            }
        }
    ]
    
    listCursor = list(sharers.aggregate(pipeline))

    jsonData = dumps(listCursor, ensure_ascii=False).encode('utf8')
    
    return jsonData

@app.route('/api/addreason/<userId>', methods=['POST'])
def addReason(userId : str):
    permission = getPermission(userId)
    if (permission != "admin"):
        return "Tài khoản không phải admin", 404
    
    reason = request.json
    reasonObj = internaladdReason(reason['name'])

    pipeline = [
        {
            '$match': {
                '_id': reasonObj['$id']
            }
        },
        {
            '$project': {
                '_id': 1,
                'name': 1,
                'created_on': {
                    '$cond': {
                        'if': {'$eq': [{'$type': '$created_on'}, 'date']},
                        'then': {
                            '$dateToString': {
                                'date': '$created_on',
                                'format': '%Y-%m-%d %H:%M:%S'
                            }
                        },
                        'else': '$created_on'
                    }
                }
            }
        }
    ]
    
    listCursor = list(reasons.aggregate(pipeline))

    jsonData = dumps(listCursor, ensure_ascii=False).encode('utf8')
    
    return jsonData

@app.route('/api/addaddress/<userId>', methods=['POST'])
def addAddress(userId : str):
    permission = getPermission(userId)
    if (permission != "admin"):
        return "Tài khoản không phải admin", 404
    
    address = request.json
    addressObj = internaladdAddress(address['name'], address['direction'], address['district'])
    pipeline = [
        {
            '$match': {
                '_id': addressObj['$id']
            }
        },
        {
            '$project': {
                'value': {'$toString': '$_id'},
                'label': {
                    '$concat': [
                        {'$ifNull': ['$name', '']}, 
                        {'$ifNull': [{'$concat': [' tới ', '$direction']}, '']},
                        {'$ifNull': [
                            { '$concat': [ ' tại ', {'$cond': {
                                'if': {'$isArray': '$district'},
                                'then': {'$reduce': {
                                    'input': '$district',
                                    'initialValue': '',
                                    'in': {'$concat': ['$$value', ' ', {'$toString': '$$this'}]}
                                }},
                                'else': {'$toString': '$district'}
                            }}]},
                            ''
                        ]},
                    ]
                },
                'name': 1,
                'direction': { "$ifNull": [ '$direction', None ] },
                'district': { "$ifNull": [ '$district', None ] },
                'districtString': {'$cond': {
                                    'if': {'$isArray': '$district'},
                                    'then': {'$reduce': {
                                        'input': '$district',
                                        'initialValue': '',
                                        'in': {'$concat': ['$$value', ' ', {'$toString': '$$this'}]}
                                    }},
                                    'else': {'$toString': '$district'}
                                }},
                'created_on':  {
                    '$cond': {
                        'if': {'$eq': [{'$type': '$created_on'}, 'date']},
                        'then': {
                            '$dateToString': {
                                'date': '$created_on',
                                'format': '%Y-%m-%d %H:%M:%S'
                            }
                        },
                        'else': '$created_on'
                    }
                }
            }
        }
    ]
    
    listCursor = list(addresses.aggregate(pipeline))

    jsonData = dumps(listCursor, ensure_ascii=False).encode('utf8')
    
    return jsonData

############################################INTERNAL SUPPORT FUNCTION############################################

def internaladdCTV(name : str, phone_number: str):
    sharer = sharers.find_one({'name': name, 'phone_number': phone_number})
    if not sharer:
        datetime_now = datetime.now()
        sharer = {
            'name': name,
            'phone_number': phone_number,
            'created_on' : datetime_now
        }

        sharer = sharers.insert_one(sharer).inserted_id
        return {'$ref': "person_sharing", '$id': sharer}

    return {'$ref': "person_sharing", '$id': ObjectId(sharer['_id'])}

def internaladdAddress(address: str, direction: str, district):
    # _address = addresses.find_one({'name': address, 'direction': direction, 'district': {'$all': district}})

    _address = addresses.find_one({'name': address, 'direction': direction, 'district': district})
    # if len(_address['district']) != len(district):
    #     _address = None

    # print(district)
    # print(_address['district'])

    if not _address:
        # print ('cannot find address and create')
        datetime_now = datetime.now()
        _address = {
            'name': address, 
            'direction': direction, 
            'district': district,
            'created_on' : datetime_now
        }
        if (_address['direction'] == ''):
            del _address['direction']

        _address_ = addresses.insert_one(_address)
        return {'$ref': "address", '$id': _address_.inserted_id}

    return {'$ref': "address", '$id': ObjectId(_address['_id'])}

def internaladdReason(reason: str):
    _reason = reasons.find_one({'name': reason})
    if not _reason:
        datetime_now = datetime.now()
        _reason = {
            'name': reason,
            'created_on' : datetime_now
        }
        
        _reason_ = reasons.insert_one(_reason)
        return {'$ref': "reason", '$id': _reason_.inserted_id}
    
    return {'$ref': "reason", '$id': ObjectId(_reason['_id'])}

############################################INTERNAL SUPPORT FUNCTION############################################

@app.route('/api/updatenews/<userId>', methods=['PATCH'])
def updateNews(userId : str):
    permission = getPermission(userId)
    if (permission == "none"):
        return "Tài khoản không tồn tại", 404
    
    _news = request.json

    if 'ctv_phone' not in _news:
        _news.update({'ctv_phone': 'thính giả'})
    if 'direction' not in _news:
        _news.update({'direction': ''})
    if 'district' not in _news:
        _news.update({'district': ['Quận khác']})
    if 'reason' not in _news:
        _news.update({'reason': 'Chưa rõ nguyên nhân'})
    if 'notice' not in _news:
        _news.update({'notice': ''})

    _news.update(
        {'personSharing' :  internaladdCTV(_news['ctv'], _news['ctv_phone'])}
    )
    _news.update(
        {'address' : internaladdAddress(_news['location'], _news['direction'], _news['district'])}
    )
    _news.update(
        {'reason' : internaladdReason(_news['reason'])}
    )

    if _news['state'] == 'Thông thoáng 40 km/h':
        _news.update({'state' : 'Thông thoáng'})
    elif _news['state'] == 'Xe đông di chuyển ổn định 35 km/h':
        _news.update({'state' : 'Xe đông di chuyển ổn định'})
    elif _news['state'] == 'Xe đông di chuyển khó khăn 15 km/h':
        _news.update({'state' : 'Xe đông di chuyển khó khăn'})
    elif _news['state'] == 'Xe đông di chuyển chậm 25 km/h':
        _news.update({'state' : 'Xe đông di chuyển chậm'})
    elif _news['state'] == 'Ùn tắc 5 km/h':
        _news.update({'state' : 'Ùn tắc'})

    speed = traffic_state.find_one({'name': _news['state']})
    _news.update({'speed' : {
        '$ref': "speed",
        '$id': ObjectId(speed['_id'])
    }})

    del _news['concatctv']
    del _news['concatlocation']
    del _news['ctv']
    del _news['ctv_phone']
    del _news['direction']
    del _news['district']
    del _news['location']
    del _news['state']

    newsId = _news['_id']['$oid']
    news.update_one(
        {
            "_id" : ObjectId(newsId)
        },
        {
            "$set": {
                "personSharing": _news['personSharing'],
                "address" : _news['address'],
                "reason" : _news['reason'],
                "speed" : _news['speed'],
                "status" : _news['status'],
                "notice" : _news['notice']
            }
        }
    )

    pipeline = [
        {
            '$match': {
                '_id': ObjectId(newsId)
            }
        },
        {
            '$lookup': {
                'from': 'person_sharing',
                'localField': 'personSharing.$id',
                'foreignField': '_id',
                'as': 'person_sharing_info'
            }
        },
        {
            '$lookup': {
                'from': 'address',
                'localField': 'address.$id',
                'foreignField': '_id',
                'as': 'address_info'
            }
        },
        {
            '$lookup': {
                'from': 'speed',
                'localField': 'speed.$id',
                'foreignField': '_id',
                'as': 'speed_info'
            }
        },
        {
            '$lookup': {
                'from': 'reason',
                'localField': 'reason.$id',
                'foreignField': '_id',
                'as': 'reason_info'
            }
        },
        {
            '$unwind': '$person_sharing_info'
        },
        {
            '$unwind': '$address_info'
        },
        {
            '$unwind': '$speed_info'
        },
        {
            '$unwind': '$reason_info'
        },
        {
            '$project': {
                '_id': 1,
                'concatctv': {'$concat': [{"$ifNull": [ '$person_sharing_info.name', ""]}, ' ', { "$ifNull": [ '$person_sharing_info.phone_number', "" ] }]},
                'ctv': '$person_sharing_info.name',
                'ctv_phone': '$person_sharing_info.phone_number',
                'concatlocation': {
                    '$concat': [
                        {'$ifNull': ['$address_info.name', '']}, 
                        {'$ifNull': [{'$concat': [' tới ', '$address_info.direction']}, '']},
                        {'$ifNull': [
                            { '$concat': [ ' tại ', {'$cond': {
                                'if': {'$isArray': '$address_info.district'},
                                'then': {'$reduce': {
                                    'input': '$address_info.district',
                                    'initialValue': '',
                                    'in': {'$concat': ['$$value', ' ', {'$toString': '$$this'}]}
                                }},
                                'else': {'$toString': '$address_info.district'}
                            }}]},
                            ''
                        ]},
                    ]
                },
                'location': '$address_info.name',
                'district': '$address_info.district',
                'concatdistrict': {'$cond': {
                                'if': {'$isArray': '$address_info.district'},
                                'then': {'$reduce': {
                                    'input': '$address_info.district',
                                    'initialValue': '',
                                    'in': {'$concat': ['$$value', ' ', {'$toString': '$$this'}]}
                                }},
                                'else': {'$toString': '$address_info.district'}
                            }},
                'direction': '$address_info.direction',
                'state': {
                    '$concat': [
                        {'$ifNull': ['$speed_info.name', '']}, 
                        {'$ifNull': [{'$concat': [ ' ', {'$toString': '$speed_info.value'}, ' km/h']}, '']},
                    ]
                },
                # 'state': '$speed_info.name',
                # 'speed': '$speed_info.value',
                'reason': '$reason_info.name',
                'distance': 1,
                'notice': 1,
                'status': 1,
                # 'created_on': {
                #     '$cond': {
                #         'if': {'$eq': [{'$type': '$created_on'}, 'date']},
                #         'then': {
                #             '$dateToString': {
                #                 'date': '$created_on',
                #                 # 'format': '%Y-%m-%d %H:%M:%S'  # Adjust the format as needed
                #                 'format': '%Y-%m-%d'  # Adjust the format as needed
                #             }
                #         },
                #         'else': '$created_on'
                #     }
                # }
                'created_on': {
                    '$cond': {
                        'if': {'$eq': [{'$type': '$created_on'}, 'date']},
                        'then': {'$dateToString': {'date': '$created_on', 'format': '%Y-%m-%d'}},
                        'else': {'$substr': ['$created_on', 0, 10]}
                    }
                }
            }
        }
    ]

    listCursor = list(news.aggregate(pipeline))
    
    jsonData = dumps(listCursor, ensure_ascii=False).encode('utf8')

    jsonData_str = jsonData.decode('utf8')
    json_obj = json.loads(jsonData_str)

    socketio.emit('update_news', json_obj)

    return "Tin đã được cập nhật!!!", 200

@app.route('/api/updatectv/<userId>', methods=['POST'])
def updateCTV(userId : str):
    permission = getPermission(userId)
    if (permission != "admin"):
        return "Tài khoản không phải admin", 404
    
    _ctv = request.json

    ctvId = _ctv['_id']['$oid']

    sharers.update_one(
        {
            "_id" : ObjectId(ctvId)
        },
        {
            "$set": {
                "name" : _ctv['name'],
                "phone_number" : _ctv['phone_number'],
            }
        }
    )
    return "Update ctv thành công", 200

@app.route('/api/updatereason/<userId>', methods=['POST'])
def updateReason(userId : str):
    permission = getPermission(userId)
    if (permission != "admin"):
        return "Tài khoản không phải admin", 404
    
    _reason = request.json

    reasonId = _reason['_id']['$oid']

    reasons.update_one(
        {
            "_id" : ObjectId(reasonId)
        },
        {
            "$set": {
                "name" : _reason['label'],
            }
        }
    )
    return "Update lý do thành công", 200

@app.route('/api/updateaddress/<userId>', methods=['POST'])
def updateAddress(userId : str):
    permission = getPermission(userId)
    if (permission != "admin"):
        return "Tài khoản không phải admin", 404
    
    _address = request.json
    print(_address)

    addressID = _address['_id']['$oid']

    addresses.update_one(
        {
            "_id" : ObjectId(addressID)
        },
        {
            "$set": {
                "name" : _address['name'],
                "direction" : _address['direction'],
                "district" : _address['district'],
            }
        }
    )

    # print(updateAddress)

    return "Update địa điểm thành công", 200

if __name__ == "__main__":
    # app.run(host='0.0.0.0', port=5000, debug=True, threaded=True)
    socketio.run(app, debug=True,port=5000)

