import sys
import json
from pinecone import Pinecone
from gen_response import send_message

# Set your API key for Pinecone
API_KEY = "pcsk_336VbM_N3MZuDxwDN9qHSzKmCyWbW9XWUbjWswiVqwrGJbMXhu7DdhKKokoXSKUdwvuHPM"

# Initialize Pinecone and the assistant object
pc = Pinecone(api_key=API_KEY)
assistant = pc.assistant.Assistant(assistant_name="official-assistant")

print(send_message("What is the name of the first person to discover the americas? Do not respond with any references to the documents.", assistant, "testing"))