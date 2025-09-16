export const passwordValidation = (password) => {
  if (password.length < 8)
    return {
      isValid: false,
      message: 'A senha deve ter no mínimo 8 caracteres.',
    }

  if (!/[A-Z]/.test(password))
    return {
      isValid: false,
      message: 'A senha deve conter pelo menos uma letra maiúscula.',
    }

  if (!/[0-9]/.test(password))
    return {
      isValid: false,
      message: 'A senha deve conter pelo menos um número.',
    }

  const regexCaractereEspecial = /[!@#$%^&*()_+=`[\]{};':"\\|,.<>/?-]/
  if (!regexCaractereEspecial.test(password))
    return {
      isValid: false,
      message: 'A senha deve conter pelo menos um caractere especial.',
    }

  return {
    isValid: true,
  }
}

export const emailValidation = (email) => {
  if (!email)
    return {
      isValid: false,
      message: 'O campo de e-mail é obrigatório.',
    }

  const emailRegex = new RegExp(
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  )

  if (!emailRegex.test(email))
    return {
      isValid: false,
      message: 'Email inválido!',
    }

  return {
    isValid: true,
  }
}

export const usernameValidation = (username) => {
  if (!username)
    return {
      isValid: false,
      message: 'O nome de usuário é obrigatório.',
    }

  if (username.length < 6)
    return {
      isValid: false,
      message: 'O nome de usuário deve ter no mínimo 6 caracteres.',
    }

  const usernameRegex = /^[a-zA-Z0-9_]*$/
  if (!usernameRegex.test(username))
    return {
      isValid: false,
      message: 'O nome de usuário não pode conter caracteres especiais.',
    }

  const onlyNumbersRegex = /^[0-9]+$/
  if (onlyNumbersRegex.test(username))
    return {
      isValid: false,
      message: 'O nome de usuário não pode ser numérico.',
    }

  return {
    isValid: true,
  }
}
