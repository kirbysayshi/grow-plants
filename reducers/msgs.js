import { ADD_MSG } from '../actions';

export default function msgs (msgs, action) {
  if (action.type === ADD_MSG) {
    return [
      action.msg,
      ...msgs
    ]
  }
  return msgs;
}
