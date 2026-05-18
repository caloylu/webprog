import { useLocation, useNavigate, useParams } from "react-router"

import { Box, Button, TextField, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { createProduct, getProduct, productImageUrl, updateProduct, uploadProductImage } from "../services/ProductsServices"
import { loadSession, session } from "../auth/Session"

function ProductsAddEdit() {

    const { id } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const isNew = id === 'new'

    const [product, setProduct] = useState<any>(() => {
        if (isNew) {
            return {
                name: '',
                description: '',
                price: 1,
                qty: 1,
            }
        }
        const st = location.state as { _id?: string } | null
        return id && st?._id === id ? st : null
    })
    const [viewerId, setViewerId] = useState<string | null>(null)
    const [isAdmin, setIsAdmin] = useState(false)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    useEffect(() => {
        loadSession()
        setViewerId(session.id)
        setIsAdmin(session.userType === 'admin')
        if (isNew || !id) {
            return
        }
        const st = location.state as { _id?: string } | null
        if (!(st?._id === id)) {
            getProduct(id).then((res) => setProduct(res.data)).catch(() => {
                setError('Could not load product.')
            })
        }
    }, [id, isNew, location.state])

    useEffect(() => {
        if (!imageFile) {
            setPreviewUrl((prev) => {
                if (prev) {
                    URL.revokeObjectURL(prev)
                }
                return null
            })
            return
        }
        const url = URL.createObjectURL(imageFile)
        setPreviewUrl(url)
        return () => {
            URL.revokeObjectURL(url)
        }
    }, [imageFile])

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

    async function maybeUploadImage(productId: string) {
        if (!imageFile) {
            return
        }
        loadSession()
        if (!session.accessToken) {
            setError('Sign in to upload a product picture.')
            return
        }
        await uploadProductImage(productId, imageFile)
        setImageFile(null)
    }

    function save() {
        if (!isAdmin) {
            setError('Only admins can add or update products.')
            return
        }
        setErrors({})
        setError('')
        if (isNew) {
            createProduct(product).then(async (response) => {
                const newId = response.data._id as string
                try {
                    await maybeUploadImage(newId)
                } catch (err: unknown) {
                    const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
                    setError(msg || 'Product saved, but the image could not be uploaded. Try editing the product.')
                    navigate(`/products/${newId}`, { state: { ...response.data } })
                    return
                }
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
            }).then(async (response) => {
                try {
                    await maybeUploadImage(product._id)
                } catch (err: unknown) {
                    const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
                    setError(msg || 'Saved, but the image could not be uploaded.')
                    setProduct(response.data)
                    return
                }
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

    if (!isNew && !product) {
        return <Box sx={{ p: 2 }}><Typography>Loading…</Typography></Box>
    }

    const displayImageSrc = previewUrl || productImageUrl(product.imageUrl)

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

        <Box sx={{ m: 1 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Product picture</Typography>
            {!viewerId ? (
                <Typography color="text.secondary" sx={{ mb: 1 }}>Sign in to upload a product picture.</Typography>
            ) : null}
            <Button variant="outlined" component="label" disabled={!viewerId} sx={{ mr: 1 }}>
                Choose image
                <input
                    hidden
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    type="file"
                    onChange={(e) => {
                        const f = e.target.files?.[0]
                        setImageFile(f ?? null)
                        e.target.value = ''
                    }}
                />
            </Button>
            {imageFile ? (
                <Button size="small" onClick={() => setImageFile(null)}>Clear selection</Button>
            ) : null}
            {displayImageSrc ? (
                <Box sx={{ mt: 2 }}>
                    <Box
                        component="img"
                        src={displayImageSrc}
                        alt="Product"
                        sx={{ maxWidth: 320, maxHeight: 320, objectFit: "contain", borderRadius: 1, border: 1, borderColor: "divider" }}
                    />
                </Box>
            ) : null}
        </Box>

        <Typography color='error'>{error}</Typography>
        {!isAdmin ? (
            <Typography color='text.secondary' sx={{ mb: 1 }}>
                Sign in as an admin to add or update products.
            </Typography>
        ) : null}
        <Button variant="outlined" sx={{ m: 1 }} onClick={() => navigate('/products')}>
            Cancel
        </Button>
        <Button variant="contained" sx={{ m: 1 }} onClick={() => save()} disabled={!isAdmin}>
            Save
        </Button>
    </Box>
}

export default ProductsAddEdit
