import { useLocation, useNavigate, useParams } from "react-router"

import { Box, Button, TextField, Typography } from "@mui/material"
import { useRef, useState } from "react"
import { createPost, updatePost } from "../services/PostsServices"
import { Editor } from "@tinymce/tinymce-react"

function PostsAddEdit() {

    const { id } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    //console.log(location.state)
    const isNew = id === 'new'
    const editorRef = useRef(null)

    const [post, setPost] = useState(isNew ? {
        user_id: '',
        title: '',
        content: ''
    } : location.state)
    const [errors, setErrors] = useState<{
        user_id?: {
            message: string
        },
        title?: {
            message: string
        },
        content?: {
            message: string
        },
    }>({})
    const [error, setError] = useState('')

    function save() {
        setErrors({})
        setError('')
        if (isNew) {
            createPost(post).then(response => {
                // message TODO
                console.log(response)
                navigate('/blog')
            }).catch(error => {
                console.log(error)
                console.log(error.response)
                if (error?.response?.data?.errors) {
                    setErrors(error.response.data.errors)
                }
                if (error?.response?.data?.error) {
                    if (error.response.status === 409) {
                        setErrors({
                            user_id: {
                                message: error.response.data.message
                            }
                        })
                    } else {
                        setError(error.response.data.message)
                    }
                }
            })
        } else {
            updatePost(post._id, {
                _id: post._id,
                title: post.title,
                content: post.content,
            }).then(response => {
                // message TODO
                console.log(response)
                navigate('/blog')
            }).catch(error => {
                console.log(error)
                console.log(error.response)
                if (error?.response?.data?.errors) {
                    setErrors(error.response.data.errors)
                }
                if (error?.response?.data?.error) {
                    if (error.response.status === 409) {
                        setErrors({
                            user_id: {
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
        <h2>{isNew ? 'Add' : 'Edit'} Post</h2>
        <TextField
            id="userid"
            fullWidth
            label="User Id"
            variant="outlined"
            value={post.user_id}
            onChange={event => {
                setPost({
                    ...post, user_id: event.target.value
                })
            }}
            error={errors.user_id !== undefined}
            helperText={errors.user_id?.message}
            sx={{ m: 1 }}
        />
        <TextField
            id="title"
            fullWidth
            label="Title"
            variant="outlined"
            value={post.title}
            onChange={event => {
                setPost({
                    ...post, title: event.target.value
                })
            }}
            error={errors.title !== undefined}
            helperText={errors.title?.message}
            sx={{ m: 1 }}
        />
        <Box sx={{ ml: 1 }}>
            <Editor
                tinymceScriptSrc={`/tinymce/tinymce.min.js`}
                onInit={(_evt: any, editor: any) => editorRef.current = editor}
                value={post.content}
                onEditorChange={(content: string) => {
                    setPost({
                        ...post, content: content
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
        <Typography color='error'>{error}</Typography>
        <Button variant="outlined" sx={{ m: 1 }} onClick={() => navigate('/blog')}>
            Cancel
        </Button>
        <Button variant="contained" sx={{ m: 1 }} onClick={() => save()}>
            Save
        </Button>
    </Box>
}

export default PostsAddEdit