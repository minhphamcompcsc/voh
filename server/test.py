from pymongo import MongoClient

# Connect to the MongoDB server
client = MongoClient('mongodb://localhost:27017')

# Access the database and collections
db = client['test']
persons_collection = db['persons']
companies_collection = db['companies']
ages_collection = db['ages']

# Perform the join using the $lookup stage
pipeline = [
    {
        '$lookup': {
            'from': 'companies',
            'localField': 'company.$id',
            'foreignField': '_id',
            'as': 'company_info'
        }
    },
    {
        '$lookup': {
            'from': 'ages',
            'localField': 'age.$id',
            'foreignField': '_id',
            'as': 'age_info'
        }
    },
    {
        '$unwind': '$company_info'
    },
    {
        '$unwind': '$age_info'
    },
    {
        '$project': {
            '_id': 0,
            'name': 1,
            'company': '$company_info.name',
            'age': '$age_info.value'
        }
    }
]

# Execute the aggregation pipeline
result = list(persons_collection.aggregate(pipeline))

# Print the result
for person in result:
    print(person)