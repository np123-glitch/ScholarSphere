from pinecone import Pinecone

pc = Pinecone(api_key="pcsk_6UCVz9_E8Nyoiconp2u2i654vS5XZSmDXzbNfYxC4aQHdGCn8f6XJuTZ7Tp9UTzuH6CtHu")
assistant = pc.assistant.Assistant(assistant_name="official-assistant")

def list_files(username):
    return assistant.list_files(filter={"userid": username})


print(list_files("neelprasad"))