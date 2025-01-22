from pypdf import PdfReader

# creating a pdf reader object
reader = PdfReader('example.pdf')


def upload(file_name, assistant, userid):
    # Extract text and filter out non-UTF-8 characters
    with open("output.txt", "w", encoding="utf-8") as f:
        for i in range(len(reader.pages)):  # Iterate over the number of pages
            page = reader.pages[i]
            text = page.extract_text()

            # Remove non-UTF-8 characters
            clean_text = text.encode("utf-8", errors="ignore").decode("utf-8")

            # Write cleaned text to the file
            f.write(clean_text + "\n")  # Add a newline after each page's text
    response = assistant.upload_file(
    file_path=file_name,
    metadata={"userid": userid},
    timeout=None,
    )