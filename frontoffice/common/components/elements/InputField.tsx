import React from 'react'

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    className?: string
}

const InputField = (props: InputFieldProps) => {
    const { className, ...rest } = props
    return (
        <input
            className={className}
            {...rest}
        />
    )
}

export default InputField