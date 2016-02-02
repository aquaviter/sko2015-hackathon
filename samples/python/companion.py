import boto3

from sense_hat import SenseHat
from boto3.dynamodb.conditions import Key, Attr

dynamodb    = boto3.resource('dynamodb')
table       = dynamodb.Table('users')
response    = table.query( TableName='SKO-IOT-Hackathon',
                            KeyConditionExpression=Key('topic').eq('sensors'),
                            Limit=1,
                            ScanIndexForward=False  )

temperature = str(response['Items'][0]['payload']['temperature'])

sense = SenseHat()
sense.show_message(temperature)

