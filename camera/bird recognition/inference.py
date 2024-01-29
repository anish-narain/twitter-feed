from roboflow import Roboflow
import os

rf = Roboflow(api_key="gVbWms0lMjysSKoBeiIt")
project = rf.workspace().project("bird-v2")
model = project.version(2).model

# Directory containing the images
data_file_folder = os.path.join(os.getcwd(), "bird_images")

# infer on a local image
print(model.predict('D:/IC/third year/embedded/Twitter/camera/raspberry pi upload/images/1.jpg', confidence=40, overlap=30).json())

# visualize your prediction
#model.predict("your_image.jpg", confidence=40, overlap=30).save("prediction.jpg")

# infer on an image hosted elsewhere
# print(model.predict("URL_OF_YOUR_IMAGE", hosted=True, confidence=40, overlap=30).json())