from django.db import migrations


ROOMS = [
    "Bascom Hill Hangout",
    "Memorial Union Meetups",
    "Witte Whispers",
    "Chadbourne Chats",
    "Red Gym Rendezvous",
    "Babcock Banter",
    "Humanities Hubbub",
]


def seed_rooms(apps, schema_editor):
    ChatRoom = apps.get_model("api", "ChatRoom")
    for name in ROOMS:
        ChatRoom.objects.get_or_create(name=name)


def unseed_rooms(apps, schema_editor):
    ChatRoom = apps.get_model("api", "ChatRoom")
    ChatRoom.objects.filter(name__in=ROOMS).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_rooms, unseed_rooms),
    ]
