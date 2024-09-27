import popupEventEmitter from './popupEventEmitter';

export const updatePopupVisible = (visible: boolean) => {
  popupEventEmitter.emit('showPopup', visible);
};
