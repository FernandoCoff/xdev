export const success = (body) => {
  return {
    success: true,
    status: 200,
    body,
  }
}

export const created = (body) => {
  return {
    success: true,
    status: 201,
    body,
  }
}

export const notFout = (body) => {
  return {
    success: false,
    status: 400,
    body,
  }
}

export const serverError = (body) => {
  return {
    success: false,
    status: 409,
    body,
  }
}
