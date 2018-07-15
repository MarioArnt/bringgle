import Cookies from 'js-cookie'

const cookiesUtils = {}

cookiesUtils.setUser = (user) => {
  Cookies.set('user_id', user.id)
  Cookies.set('user_name', user.name)
  Cookies.set('user_email', user.email)
  console.log('User saved in cookies')
  console.log(Cookies.get())
}

cookiesUtils.getUser = () => {
  const user = {}
  const cookies = Cookies.get()
  if (cookies.user_id) user.id = cookies.user_id
  if (cookies.user_name) user.name = cookies.user_name
  if (cookies.user_email) user.email = cookies.user_email
  console.log('Reading user cookies')
  console.log(user)
  return user
}

export default cookiesUtils
