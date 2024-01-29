from bird_model_copy import predict_image, BirdResnet, ResNet34, get_default_device, to_device
import torch

device=get_default_device()

model = to_device(ResNet34(3,450), device)
model=(BirdResnet(model))
model.load_state_dict(torch.load('bird-resnet34best.pth',map_location=torch.device(device)))


label, acc = predict_image('https://idkw.s3.eu-west-2.amazonaws.com/2.jpg', model)

print('Predicted:',label,' with a probability of', acc +'%')
