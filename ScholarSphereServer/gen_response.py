from pinecone_plugins.assistant.models.chat import Message


def send_message(message, assistant, filterUser):
    chat_context = [Message(role="user", content=message)]
    response = assistant.chat_completions(messages=chat_context, filter={"userid": filterUser})
    return response['choices'][0]['message']['content']