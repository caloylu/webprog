import { Box, Button, TextField, Typography } from "@mui/material"
import { useNavigate } from "react-router";
import { useState } from "react";
import { signUp } from "../services/AuthServices";

export type UserType = {
    _id?: string,
    name: string,
    email: string,
    password: string,
}

function SignUp() {

    const navigate = useNavigate()
    const emptyEntry = {
        name: '',
        email: '',
        password: '',
        retypePassword: '',
    }
    const [entry, setEntry] = useState(emptyEntry)
    const [error, setError] = useState(emptyEntry)
    const [otherError, setOtherError] = useState('')

    function save() {
        setError(emptyEntry)
        setOtherError('')
        const err = { ...emptyEntry }
        if (entry.name.trim() === '') {
            err.name = 'Name is required'
        }
        if (entry.email.trim() === '') {
            err.email = 'Email is required'
        }
        if (entry.password === '') {
            err.password = 'Password is required'
        }
        if (entry.retypePassword === '') {
            err.retypePassword = 'Please confirm your password'
        }
        if (err.name || err.email || err.password || err.retypePassword) {
            setError(err)
            return
        }
        if (entry.password !== entry.retypePassword) {
            setError({
                ...emptyEntry,
                password: 'Passwords did not match',
                retypePassword: 'Passwords did not match',
            })
            return
        }
        signUp({
            name: entry.name,
            email: entry.email,
            password: entry.password.trim(),
        }).then(({ data, status }) => {
            if (status === 201) {
                navigate('/login')
            } else {
                setOtherError(data?.message || 'Registration failed.')
            }
        }).catch((error: { response?: { data?: { message?: string; error?: string | boolean } } }) => {
            const msg =
                error.response?.data?.message ||
                (typeof error.response?.data?.error === 'string' ? error.response.data.error : null) ||
                'Registration failed. Please try again.'
            setOtherError(msg)
        })
    }

    return (
        <Box sx={{ padding: 1 }}>
            <Typography variant="h4" component="h4" sx={{ pb: 2, pt: 1 }}>Register</Typography>
            <TextField
                fullWidth
                id="name"
                label="Name"
                variant="outlined"
                value={entry.name}
                error={error.name.length > 0}
                helperText={error.name}
                onChange={event => {
                    setEntry({
                        ...entry, name: event.target.value
                    })
                }}
                sx={{
                    "& .MuiInputBase-root": {
                        height: '65px'
                    },
                    mr: 0.5,
                    mb: 1.5
                }}
            />
            <TextField
                fullWidth
                id="email"
                label="Email"
                variant="outlined"
                value={entry.email}
                error={error.email.length > 0}
                helperText={error.email}
                onChange={event => {
                    setEntry({
                        ...entry, email: event.target.value
                    })
                }}
                sx={{
                    "& .MuiInputBase-root": {
                        height: '65px'
                    },
                    mr: 0.5,
                    mb: 1.5
                }}
            />
            <TextField
                fullWidth
                id="password"
                label="Password"
                type="password"
                error={error.password.length > 0}
                helperText={error.password}
                variant="outlined"
                value={entry.password}
                onChange={event => setEntry({
                    ...entry, password: event.target.value
                })}
                sx={{
                    mb: 1.5
                }}
            />
            <TextField
                fullWidth
                id="retypePassword"
                label="Retype Password"
                type="password"
                error={error.retypePassword.length > 0}
                helperText={error.retypePassword}
                variant="outlined"
                value={entry.retypePassword}
                onChange={event => setEntry({
                    ...entry, retypePassword: event.target.value
                })}
                sx={{
                    mb: 1.5
                }}
            />
            <Typography color='error'>{otherError}</Typography>
            <Button variant="outlined" onClick={() => navigate('/')}>Cancel</Button>
            <Button variant="contained" onClick={() => save()} sx={{ ml: 1 }}>Register</Button>
        </Box>
    )
}

export default SignUp