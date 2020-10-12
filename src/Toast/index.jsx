import ReactDOM from 'react-dom';
import React from 'react';
import uuid from "../uuid";
import './toast.css';
//toast的位置，可选：top-left, top-center, top-right, bottom-left, bottom-center, bottom-right
const PLACEMENT = 'top-center';
//最大toast数量
const MAX_COUNT = 1;
const store = {
  toasts: [],
  callback: () => {
  },
  show: function (toast) {
    const newToast = Object.assign({}, toast);
    newToast.id = uuid();
    this.toasts.push(newToast);
    if (this.toasts.length > MAX_COUNT) {
      this.toasts.shift();
    }
    this.update();
    if (toast.timeout) {
      setTimeout(() => {
        const idx = this.findIdx(newToast.id);
        if (idx > -1) {
          this.toasts.splice(idx, 1);
          this.update();
        }
      }, toast.timeout)
    }
  },
  findIdx: function (id) {
    let idx = -1;
    for (let i = 0; i < this.toasts.length; i++) {
      if (this.toasts[i].id === id) {
        idx = i;
        break;
      }
    }
    return idx;
  },
  listen: function (callback) {
    this.callback = callback;
  },
  update: function () {
    this.callback(this.toasts);
  }
}

const Toast = () => {
  const [toasts, setToasts] = React.useState([]);
  React.useEffect(() => {
    store.listen((toastArr) => {
      setToasts([...toastArr]);
    });
  }, [])

  return (
    <div className={`'ui-toast-wrapper' ${PLACEMENT}`}>
      {
        toasts.map(toast => (
          <div key={toast.id} className={`'ui-toast' ${toast.className}`}>
            {toast.icon}
            {toast.content}
          </div>
        ))
      }
    </div>
  )
}

Toast.show = (content, props, icon) => {
  props = Object.assign({
    timeout: 2600
  }, props);
  const todo = () => {
    store.show({
      content,
      icon,
      ...props
    })
  }
  let wrapper = document.querySelector('.ui-toast-wrapper');
  if (!wrapper) {
    const root = document.createElement('div')
    document.body.appendChild(root);
    ReactDOM.render(<Toast/>, root);
    setTimeout(todo)
  } else {
    todo();
  }
}

export default Toast;
