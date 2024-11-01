from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

scheduler = AsyncIOScheduler()

async def daily_task():
    # Implement your daily task here
    print("Running daily task")

def setup_scheduled_tasks():
    scheduler.add_job(daily_task, CronTrigger(hour=0, minute=0))
    scheduler.start()

