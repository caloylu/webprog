import { useLocation, useNavigate, useParams } from "react-router"

import { Box, Button, TextField, Typography } from "@mui/material"
import { useState } from "react"
import { createProduct, updateProduct } from "../services/ProductsServices"

function ProductsAddEdit() {

    const { id } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    //console.log(location.state)
    const isNew = id === 'new'

    const [product, setProduct] = useState(isNew ? {
        name: '',
        description: '',
        price: 1,
        qty: 1
    } : location.state)
    const [errors, setErrors] = useState<{
        name?: {
            message: string
        },
        description?: {
            message: string
        },
        price?: {
            message: string
        },
        qty?: {
            message: string
        },
    }>({})
    const [error, setError] = useState('')

    function save() {
        setErrors({})
        setError('')
        if (isNew) {
            createProduct(product).then(response => {
                // message TODO
                console.log(response)
                navigate('/products')
            }).catch(error => {
                console.log(error)
                console.log(error.response)
                if (error?.response?.data?.errors) {
                    setErrors(error.response.data.errors)
                }
                if (error?.response?.data?.error) {
                    if (error.response.status === 409) {
                        setErrors({
                            name: {
                                message: error.response.data.message
                            }
                        })
                    } else {
                        setError(error.response.data.message || error.response.data.error)
                    }
                }
            })
        } else {
            updateProduct(product._id, {
                _id: product._id,
                name: product.name,
                description: product.description,
                price: product.price,
                qty: product.qty
            }).then(response => {
                // message TODO
                console.log(response)
                navigate('/products')
            }).catch(error => {
                console.log(error)
                console.log(error.response)
                if (error?.response?.data?.errors) {
                    setErrors(error.response.data.errors)
                }
                if (error?.response?.data?.error) {
                    if (error.response.status === 409) {
                        setErrors({
                            name: {
                                message: error.response.data.message
                            }
                        })
                    } else {
                        setError(error.response.data.message || error.response.data.error)
                    }
                }
            })
        }
    }

    return <Box>
        <h2>{isNew ? 'Add' : 'Edit'} Product</h2>
        <TextField
            id="name"
            fullWidth
            label="Name"
            variant="outlined"
            value={product.name}
            onChange={event => {
                setProduct({
                    ...product, name: event.target.value
                })
            }}
            error={errors.name !== undefined}
            helperText={errors.name?.message}
            sx={{ m: 1 }}
        />
        <TextField
            id="description"
            fullWidth
            label="Description"
            variant="outlined"
            value={product.description}
            onChange={event => {
                setProduct({
                    ...product, description: event.target.value
                })
            }}
            error={errors.description !== undefined}
            helperText={errors.description?.message}
            sx={{ m: 1 }}
        />
        <TextField
            id="price"
            fullWidth
            label="Price"
            variant="outlined"
            value={product.price}
            onChange={event => {
                setProduct({
                    ...product, price: event.target.value
                })
            }}
            error={errors.price !== undefined}
            helperText={errors.price?.message}
            sx={{ m: 1 }}
        />
        <TextField
            id="qty"
            fullWidth
            label="Quantity"
            variant="outlined"
            value={product.qty}
            onChange={event => {
                setProduct({
                    ...product, qty: event.target.value
                })
            }}
            error={errors.qty !== undefined}
            helperText={errors.qty?.message}
            sx={{ m: 1 }}
        />
        <Typography color='error'>{error}</Typography>
        <Button variant="outlined" sx={{ m: 1 }} onClick={() => navigate('/products')}>
            Cancel
        </Button>
        <Button variant="contained" sx={{ m: 1 }} onClick={() => save()}>
            Save
        </Button>
    </Box>
}

export default ProductsAddEdit
