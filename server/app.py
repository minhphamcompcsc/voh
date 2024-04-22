from flask import Flask, request, jsonify, session
from flask_session import Session
from flask_bcrypt import Bcrypt
from flask_cors import CORS, cross_origin

from pymongo import MongoClient
from bson.json_util import dumps
from bson.objectid import ObjectId
from datetime import datetime, timedelta

from flask_socketio import SocketIO, emit

app = Flask(__name__)

@app.route('/')
def index():
    return "success!"

# Set up MongoDB connection and collection 
client = MongoClient('mongodb://localhost:27017/') 

# Create utraffic_voh database if it doesn't exist already 
db = client['utraffic_voh'] 

# Create accounts and news collections if they don't exist already
accounts = db['user']
news = db['record']
addresses = db['address']
sharers = db['person_sharing']
reasons = db['reason']
traffic_state = db['speed']



# Authenticate a login attempt with input username and password
@app.route('/api/authenticate/<username>/<password>', methods=['POST'])
def authenticate(username : str, password : str):
    # Find the matching account in the database
    account = accounts.find_one(
        {
            "username": username,
            "password": password
        })
    
    if (account == None):
        # If no matching account, return an error
        return "Tên đăng nhập hoặc mật khẩu không hợp lệ!!!", 404
    else:
	    # If there is a matching account, return the account id
        acc = {
            "id": str(account['_id']),
            "name": account['name'],
            "role": account['role']
        }
        return acc

    # return [str(account['_id']), account['name']]

# Get permission of a particular account
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

@app.route('/api/admin/accounts/<userId>', methods=['GET'])
def getAccounts(userId : str):
    # permission = getPermission(userId)
    # if (permission != "admin"):
    #     return "Tài khoản không phải admin", 404
    
    cursor = accounts.find({}, {"password": 0, "_class": 0}).sort("created_on", 1)
    
    # Convert Pymongo cursor to JSON
    listCursor = list(cursor)
    jsonData = dumps(listCursor, ensure_ascii=False).encode('utf8')
    
    return jsonData

@app.route('/api/ctv/<userId>', methods=['GET'])
def getCTV(userId : str):
    # permission = getPermission(userId)
    # if (permission == "mc" or permission == 'none'):
    #     return "Tài khoản không hợp lệ", 404
    pipeline = [
        {
            '$project': {
                'value': {'$toString': '$_id'},
                'label': {'$concat': [{"$ifNull": [ '$name', ""]}, ' ', { "$ifNull": [ '$phone_number', "" ] }]},
                'name': 1,
                'phone_number': 1,
                'created_on': 1,
            }
        }
    ]
    
    listCursor = list(sharers.aggregate(pipeline))
    # print(listCursor)

    jsonData = dumps(listCursor, ensure_ascii=False).encode('utf8')
    
    return jsonData

@app.route('/api/address/<userId>', methods=['GET'])
def getAddress(userId : str):
    # permission = getPermission(userId)
    # if (permission == "mc" or permission == 'none'):
    #     return "Tài khoản không hợp lệ", 404
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
            }
        }
    ]
    
    listCursor = list(addresses.aggregate(pipeline))
    # print(listCursor)

    jsonData = dumps(listCursor, ensure_ascii=False).encode('utf8')
    
    return jsonData

@app.route('/api/speed/<userId>', methods=['GET'])
def getSpeed(userId : str):
    # permission = getPermission(userId)
    # if (permission == "mc" or permission == 'none'):
    #     return "Tài khoản không hợp lệ", 404
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
    # print(listCursor)

    jsonData = dumps(listCursor, ensure_ascii=False).encode('utf8')
    
    return jsonData

@app.route('/api/reasons/<userId>', methods=['GET'])
def getReason(userId : str):
    # permission = getPermission(userId)
    # if (permission == "mc" or permission == 'none'):
    #     return "Tài khoản không hợp lệ", 404
    pipeline = [
        {
            '$project': {
                'value': {'$toString': '$_id'},
                'label': '$name'
            }
        }
    ]
    
    listCursor = list(reasons.aggregate(pipeline))
    # print(listCursor)

    jsonData = dumps(listCursor, ensure_ascii=False).encode('utf8')
    
    return jsonData

# Get news that a particular account can view
@app.route('/api/getnews/<userId>', methods=['POST'])
def getNews(userId : str):
    permission = getPermission(userId)
    if (permission == "none"):
        return "Tài khoản không tồn tại", 404
# @app.route('/api/news', methods=['GET'])
# def getNews():

    pipeline = [
        # {
        #     '$match': {
        #         'created_on': {
        #             '$gte': start_date,
        #             '$lte': end_date
        #         }
        #     }
        # },
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
                'ctv': {'$concat': [{"$ifNull": [ '$person_sharing_info.name', ""]}, ' ', { "$ifNull": [ '$person_sharing_info.phone_number', "" ] }]},
                # 'ctv': '$person_sharing_info.name',
                # 'ctv_phone': '$person_sharing_info.phone_number',
                'location': {
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
                # 'location': '$address_info.name',
                # 'district': '$address_info.district',
                # 'direction': '$address_info.direction',
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
                'created_on': {
                    '$cond': {
                        'if': {'$eq': [{'$type': '$created_on'}, 'date']},
                        'then': {
                            '$dateToString': {
                                'date': '$created_on',
                                # 'format': '%Y-%m-%d %H:%M:%S'  # Adjust the format as needed
                                'format': '%Y-%m-%d'  # Adjust the format as needed
                            }
                        },
                        'else': '$created_on'
                    }
                }
            }
        }
    ]

    if request.json != None:
        date_range = request.json

        # Convert the date strings to datetime objects
        start_date = datetime.strptime(date_range[0], '%Y-%m-%d') - timedelta(days=1)
        end_date = datetime.strptime(date_range[1], '%Y-%m-%d') + timedelta(days=1)

        pipeline.insert(0, {
            '$match': {
                'created_on': {
                    '$gte': start_date,
                    '$lte': end_date
                }
            }
        })

    listCursor = list(news.aggregate(pipeline))
    
    jsonData = dumps(listCursor, ensure_ascii=False).encode('utf8')
    
    return jsonData

@app.route('/statistic/test', methods=['GET'])
def getData():
    # cursor = news.find(
    #         {
	# 			"status": "Chờ đọc"
	# 		})

    # list_cur = list(cursor)

    # for obj in list_cur:
    #     obj['created_on'] = obj['created_on'].date().__str__()

    # json_data = dumps(list_cur, ensure_ascii=False).encode('utf8')

    # return json_data
    current_date = datetime.now()
    start_date = datetime(current_date.year, current_date.month, 1)
    end_date = datetime(current_date.year, current_date.month + 1, 1) - timedelta(days=1)


    pipeline = [{
            '$match': {
                'created_on': {
                    '$gte': start_date,
                    '$lte': end_date
                }
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
                'ctv': {'$concat': [{"$ifNull": [ '$person_sharing_info.name', ""]}, ' ', { "$ifNull": [ '$person_sharing_info.phone_number', "" ] }]},
                'location': {
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
                'state': {
                    '$concat': [
                        {'$ifNull': ['$speed_info.name', '']}, 
                        {'$ifNull': [{'$concat': [ ' ', {'$toString': '$speed_info.value'}, ' km/h']}, '']},
                    ]
                },
                'reason': '$reason_info.name',
                'distance': 1,
                'notice': 1,
                'status': 1,
                'created_on': '$created_on'
            }
        }
    ]

    listCursor = list(news.aggregate(pipeline))
    for obj in listCursor:
        obj['created_on'] = obj['created_on'].date().__str__()
    jsonData = dumps(listCursor, ensure_ascii=False).encode('utf8')
    return jsonData

@app.route('/api/addnews/<userId>', methods=['POST'])
def addNews(userId : str):
    permission = getPermission(userId)
    if (permission == "mc"):
        return "Tài khoản này không thể thêm tin!!!", 403
    
    datetime_now = datetime.now()
    _news = request.json
    _news.update({'created_on' : datetime_now})
    _news.update({'status' : 'Chờ đọc'})
    _news.update({'distance' : 100})

    if 'phone_number' not in _news:
        _news.update({'phone_number': ''})
    if 'direction' not in _news:
        _news.update({'direction': ''})
    if 'district' not in _news:
        _news.update({'district': ''})
    if 'reason' not in _news:
        _news.update({'reason': ''})
    if 'notice' not in _news:
        _news.update({'notice': ''})
    print(_news)

    sharer = sharers.find_one({'name': _news['personSharing']}) if _news['phone_number'] == '' else sharers.find_one({'phone_number': _news['phone_number']})

    if not sharer:
        # Create a new company document
        sharer = {
            'name': _news['personSharing'],
            'created_on' : datetime_now
        }
        if _news['phone_number'] != '':
            sharer.update({'phone_number' : _news['phone_number']})

        sharer = sharers.insert_one(sharer)
        _news['personSharing'] = {
            '$ref': "person_sharing",
            '$id': sharer.inserted_id
        }
    else:
        _news['personSharing'] = {
            '$ref': "person_sharing",
            '$id': ObjectId(sharer['_id'])
        }

    address = addresses.find_one({'name': _news['address']})
    createNewAddress = True if not address else False
    if address and 'district' not in address and _news['district'] != '':
        createNewAddress = True
    if address and 'district' in address and _news['district'] != address['district']:
        createNewAddress = True
    if address and 'direction' not in address and _news['direction'] != '':
        createNewAddress = True
    if address and 'direction' in address and _news['direction'] != address['direction']:
        createNewAddress = True

    if createNewAddress:
        address = {
            'name': _news['address'],
            'created_on' : datetime_now
        }
        if _news['district'] != '':
            address.update({'district' : _news['district']})
        if _news['direction'] != '':
            address.update({'direction' : _news['direction']})
        
        address = addresses.insert_one(address)
        _news['address'] = {
            '$ref': "address",
            '$id': address.inserted_id
        }
    else:
        _news['address'] = {
            '$ref': "address",
            '$id': ObjectId(address['_id'])
        }
    
    speed = traffic_state.find_one({'name': _news['state']})
    _news['speed'] = {
        '$ref': "speed",
        '$id': ObjectId(speed['_id'])
    }

    reason = reasons.find_one({'name': _news['reason']}) if _news['reason'] != '' else reasons.find_one({'name': 'Chưa rõ nguyên nhân'})
    if not reason:
        reason = {
            'name': _news['reason'],
            'created_on' : datetime_now
        }
        
        reason = reasons.insert_one(reason)
        _news['reason'] = {
            '$ref': "reason",
            '$id': reason.inserted_id
        }
    else:
        _news['reason'] = {
            '$ref': "reason",
            '$id': ObjectId(reason['_id'])
        }

    del _news['phone_number']
    del _news['district']
    del _news['state']
    del _news['direction']

    newsId =  news.insert_one(_news).inserted_id
    pipeline = [
        {
            '$match': {
                '_id': newsId
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
                'ctv': {'$concat': [{"$ifNull": [ '$person_sharing_info.name', ""]}, ' ', { "$ifNull": [ '$person_sharing_info.phone_number', "" ] }]},
                # 'ctv': '$person_sharing_info.name',
                # 'ctv_phone': '$person_sharing_info.phone_number',
                'location': {
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
                # 'location': '$address_info.name',
                # 'district': '$address_info.district',
                # 'direction': '$address_info.direction',
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
                'created_on': {
                    '$cond': {
                        'if': {'$eq': [{'$type': '$created_on'}, 'date']},
                        'then': {
                            '$dateToString': {
                                'date': '$created_on',
                                # 'format': '%Y-%m-%d %H:%M:%S'  # Adjust the format as needed
                                'format': '%Y-%m-%d'  # Adjust the format as needed
                            }
                        },
                        'else': '$created_on'
                    }
                }
            }
        }
    ]

    listCursor = list(news.aggregate(pipeline))
    
    jsonData = dumps(listCursor, ensure_ascii=False).encode('utf8')
    
    # print(jsonData)
    return jsonData

@app.route('/api/updatenews/<userId>', methods=['PATCH'])
def updateNews(userId : str):
    _news = request.json
    newsId = _news['_id']['$oid']
    news.update_one(
        {
            "_id" : ObjectId(newsId)
        },
        {
            "$set": {
                "status" : _news['status'],
                "notice" : _news['notice']
            }
        }
    )
    return "Tin đã được cập nhật!!!", 200

@app.route('/news/<userId>', methods=['DELETE'])
def deleteNews(userId : str):
    permission = getPermission(userId)
    if (permission != "write"):
        return "Tài khoản này không thể xóa tin!!!", 403
    
    _news = request.json
    newsId = _news['_id']['$oid']
    news.delete_one(
        {
            "_id" : ObjectId(newsId)
        }   
    )
    return "Tin đã được xóa", 200

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True, threaded=True)

