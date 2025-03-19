from pinecone_plugins.assistant.models.chat import Message


def send_message(message, assistant, filterUser):
    chat_context = [Message(role="user", content=message)]
    filter_query = {
        "$or": [
            {"userid": filterUser},
            {"is_common": True}
        ]
    }
    response = assistant.chat_completions(
        messages=chat_context,
        filter=filter_query
    )
    return response['choices'][0]['message']['content']
