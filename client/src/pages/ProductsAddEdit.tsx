import { useLocation, useNavigate, useParams } from "react-router"

import { Box, Button, TextField, Typography } from "@mui/material"
import { useRef, useState } from "react"
import { createProduct, updateProduct } from "../services/ProductsServices"
import { Editor } from "@tinymce/tinymce-react"

function ProductsAddEdit() {

    const { id } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    // console.log(location.state)
    const isNew = id === 'new'
    const editorRef = useRef(null)
    

    const [product, setProduct] = useState(isNew ? {
        name: '',
        description: '',
        price: 1,
        qty: 1,
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
        }
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
                        setError(error.response.data.message)
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
                        setError(error.response.data.message)
                    }
                }
            })
        }
    }

    return <Box>
        <h2>{id === 'new' ? 'Add' : 'Edit'} Product</h2>
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
       <Box sx={{ ml: 1 }}>
            <Editor
                tinymceScriptSrc={`/tinymce/tinymce.min.js`}
                onInit={(_evt: any, editor: any) => editorRef.current = editor}
                value={product.description}
                onEditorChange={(content: string) => {
                    setProduct({
                        ...product, description: content
                    })
                }}
                init={{
                    height: 500,
                    menubar: false,
                    plugins: [
                        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                        'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount', 'charmap', 'emoticons'
                    ],
                    toolbar: 'undo redo fullscreen | bold italic underline cut copy paste | link unlink strikethrough superscript subscript | ' +
                        'highlight forecolor backcolor removeformat search  | ' +
                        'align numlist bullist outdent indent image media | ' +
                        'styles fontsizeinput lineheight | ' +
                        'table hr charmap emoticons anchor | ' +
                        'detectverse code preview help',
                    toolbar_mode: 'sliding',
                    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                }}
            />
        </Box>
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