import cv2


class DIEMPlus:
    def __init__(self):
        pass

    def process(self, image):
        enhanced = cv2.bilateralFilter(image, 5, 30, 30)
        return enhanced