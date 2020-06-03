from os import environ
from googleapiclient import discovery
from datetime import datetime,timedelta
from dateutil.tz import tzlocal
from phue import Bridge

hue_bridge_ip = '192.168.0.15'
light_id= 8

# connect to bridge
b = Bridge(hue_bridge_ip)

# get current time and time in one minute with current timezone
now = datetime.now(tzlocal())
dt_string_start = now.strftime('%Y-%m-%dT%H:%M:%S%z')
dt_string_end = (now+timedelta(minutes=1)).strftime('%Y-%m-%dT%H:%M:%S%z')
# connect to google calendar service
calendar_service = discovery.build('calendar', 'v3', developerKey=environ.get('CALENDAR_API_KEY'))
# get list of current events
events = calendar_service.events().list(calendarId=environ.get('CALENDAR_ID'), timeMin=dt_string_start,timeMax=dt_string_end).execute()
# if at least one event is in progress set light on else set it off
b.set_light(light_id,'on', len(events['items'])>0)
