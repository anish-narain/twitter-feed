from bird_model import predict_image, BirdResnet, ResNet34, get_default_device, to_device
import torch
import os

device=get_default_device()

model = to_device(ResNet34(3,450), device)
model=(BirdResnet(model))
model.load_state_dict(torch.load('bird-resnet34best.pth',map_location=torch.device(device)))


# Directory containing the images
data_file_folder = os.path.join(os.getcwd(), "test")

for file in os.listdir(data_file_folder):
    label, acc = predict_image(os.path.join(data_file_folder, file), model)

    print('For filename', file, 'Predicted:',label,' with a probability of', acc +'%')