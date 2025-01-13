from pinecone_plugins.assistant.models.chat import Message


def send_message(message, assistant):
    msg = Message(role="user", content=message)
    resp = assistant.chat(messages=[msg])
    return resp['message']['content']