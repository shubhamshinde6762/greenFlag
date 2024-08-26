import { Schema, model } from "mongoose";

const userBehaviorSchema = new Schema({
  cursorData: [
    {
      x: { type: Number },
      y: { type: Number },
      timestamp: { type: String },
    },
  ],
  clickData: [
    {
      element: { type: String },
      x: { type: Number },
      y: { type: Number },
      timestamp: { type: String },
    },
  ],
  keystrokeData: [
    {
      key: { type: String },
      duration: { type: Number },
      keyPressDuration: { type: Number },
    },
  ],
  scrollData: [
    {
      scrollTop: { type: Number },
      scrollSpeed: { type: Number },
      direction: { type: String },
      timestamp: { type: String },
    },
  ],
  timeOnPage: { type: Number },
  formInteraction: [
    {
      fieldName: { type: String },
      timeSpent: { type: Number },
    },
  ],
  hoverData: [
    {
      element: { type: String },
      duration: { type: Number },
    },
  ],
  idleTime: { type: Number },
  windowFocusData: [
    {
      focused: { type: Boolean },
      timestamp: { type: String },
    },
  ],
  deviceInfo: {
    deviceType: { type: String },
    browser: { type: String },
    os: { type: String },
  },
  copyPasteData: [
    {
      action: { type: String },
      field: { type: String },
      timestamp: { type: String },
    },
  ],
  zoomLevel: { type: Number },
  resizeData: [
    {
      width: { type: Number },
      height: { type: Number },
      timestamp: { type: String },
    },
  ],
  pageVisibility: [
    {
      visible: { type: Boolean },
      timestamp: { type: String },
    },
  ],
  geoLocation: {
    latitude: { type: Number },
    longitude: { type: Number },
    accuracy: { type: Number },
  },
  deviceOrientation: {
    alpha: { type: Number },
    beta: { type: Number },
    gamma: { type: Number },
  },
  touchData: [
    {
      x: { type: Number },
      y: { type: Number },
      pressure: { type: Number },
      timestamp: { type: String },
    },
  ],
  dragDropData: [
    {
      element: { type: String },
      startX: { type: Number },
      startY: { type: Number },
      endX: { type: Number },
      endY: { type: Number },
      timestamp: { type: String },
    },
  ],
});

const UserBehavior = model("UserBehavior", userBehaviorSchema);
export default UserBehavior;
