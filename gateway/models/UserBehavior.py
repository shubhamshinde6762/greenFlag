from mongoengine import Document, EmbeddedDocument, fields, connect

class CursorData(EmbeddedDocument):
    x = fields.FloatField()
    y = fields.FloatField()
    timestamp = fields.StringField()

class ClickData(EmbeddedDocument):
    element = fields.StringField()
    x = fields.FloatField()
    y = fields.FloatField()
    timestamp = fields.StringField()

class KeystrokeData(EmbeddedDocument):
    key = fields.StringField()
    duration = fields.FloatField()
    keyPressDuration = fields.FloatField()

class ScrollData(EmbeddedDocument):
    scrollTop = fields.FloatField()
    scrollSpeed = fields.FloatField()
    direction = fields.StringField()
    timestamp = fields.StringField()

class FormInteraction(EmbeddedDocument):
    fieldName = fields.StringField()
    timeSpent = fields.FloatField()

class HoverData(EmbeddedDocument):
    element = fields.StringField()
    duration = fields.FloatField()

class WindowFocusData(EmbeddedDocument):
    focused = fields.BooleanField()
    timestamp = fields.StringField()

class CopyPasteData(EmbeddedDocument):
    action = fields.StringField()
    field = fields.StringField()
    timestamp = fields.StringField()

class ResizeData(EmbeddedDocument):
    width = fields.FloatField()
    height = fields.FloatField()
    timestamp = fields.StringField()

class PageVisibility(EmbeddedDocument):
    visible = fields.BooleanField()
    timestamp = fields.StringField()

class GeoLocation(EmbeddedDocument):
    latitude = fields.FloatField()
    longitude = fields.FloatField()
    accuracy = fields.FloatField()

class DeviceOrientation(EmbeddedDocument):
    alpha = fields.FloatField()
    beta = fields.FloatField()
    gamma = fields.FloatField()

class TouchData(EmbeddedDocument):
    x = fields.FloatField()
    y = fields.FloatField()
    pressure = fields.FloatField()
    timestamp = fields.StringField()

class DragDropData(EmbeddedDocument):
    element = fields.StringField()
    startX = fields.FloatField()
    startY = fields.FloatField()
    endX = fields.FloatField()
    endY = fields.FloatField()
    timestamp = fields.StringField()

class DeviceInfo(EmbeddedDocument):
    deviceType = fields.StringField()
    browser = fields.StringField()
    os = fields.StringField()

class UserBehavior(Document):
    cursorData = fields.ListField(fields.EmbeddedDocumentField(CursorData))
    clickData = fields.ListField(fields.EmbeddedDocumentField(ClickData))
    keystrokeData = fields.ListField(fields.EmbeddedDocumentField(KeystrokeData))
    scrollData = fields.ListField(fields.EmbeddedDocumentField(ScrollData))
    timeOnPage = fields.FloatField()
    formInteraction = fields.ListField(fields.EmbeddedDocumentField(FormInteraction))
    hoverData = fields.ListField(fields.EmbeddedDocumentField(HoverData))
    idleTime = fields.FloatField()
    windowFocusData = fields.ListField(fields.EmbeddedDocumentField(WindowFocusData))
    deviceInfo = fields.EmbeddedDocumentField(DeviceInfo)
    copyPasteData = fields.ListField(fields.EmbeddedDocumentField(CopyPasteData))
    zoomLevel = fields.FloatField()
    resizeData = fields.ListField(fields.EmbeddedDocumentField(ResizeData))
    pageVisibility = fields.ListField(fields.EmbeddedDocumentField(PageVisibility))
    geoLocation = fields.EmbeddedDocumentField(GeoLocation)
    deviceOrientation = fields.EmbeddedDocumentField(DeviceOrientation)
    touchData = fields.ListField(fields.EmbeddedDocumentField(TouchData))
    dragDropData = fields.ListField(fields.EmbeddedDocumentField(DragDropData))
    browserFingerprint = fields.StringField()  # Added browser fingerprint field
