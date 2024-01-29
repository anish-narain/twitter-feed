from bird_model import predict_image, BirdResnet, ResNet34, get_default_device, to_device
import torch

device=get_default_device()

model = to_device(ResNet34(3,450), device)
model=(BirdResnet(model))
model.load_state_dict(torch.load('bird-resnet34best.pth',map_location=torch.device(device)))


predict_image('./bird_images/1.jpg', model)
