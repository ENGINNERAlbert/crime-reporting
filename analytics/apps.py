from django.apps import AppConfig
from django.db.utils import OperationalError, ProgrammingError
import json

class AnalyticsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'analytics'

    def ready(self):
        try:
            # Import the correct task so it's discoverable
            from analytics.tasks import check_crime_spike

            # Optional: Import signals if you are using them
            import analytics.signals

            # Remove Celery-Beat related code
            # This was the previous Celery-Beat task and interval schedule setup:
            # schedule, _ = IntervalSchedule.objects.get_or_create(
            #     every=10,
            #     period=IntervalSchedule.MINUTES,
            # )
            #
            # PeriodicTask.objects.get_or_create(
            #     interval=schedule,
            #     name='Detect Crime Spike',
            #     task='analytics.tasks.check_crime_spike',  # Update this as well
            #     defaults={
            #         'kwargs': json.dumps({}),
            #         'enabled': True,
            #     }
            # )

        except (OperationalError, ProgrammingError):
            # Database might not be ready (e.g., during initial migrations)
            pass
