import { useLocation, useNavigate, useParams } from "react-router"

import { Box, Button, Divider, Paper, TextField, Typography } from "@mui/material"
import { useEffect, useRef, useState } from "react"
import { createPost, updatePost, getPost } from "../services/PostsServices"
import { createComment, listCommentsForPost, updateComment } from "../services/CommentsServices"
import { Editor } from "@tinymce/tinymce-react"
import { loadSession, session } from "../auth/Session"
import { format } from "date-fns/format"
import { parseISO } from "date-fns/parseISO"

export type CommentType = {
    _id: string
    post_id: string
    user_id: string
    user_name: string
    content: string
    createdAt?: string
}

function PostsAddEdit() {

    const { id } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const isNew = id === 'new'
    const editorRef = useRef(null)

    const [post, setPost] = useState<any>(() => {
        if (isNew) {
            return { user_id: session.id ?? '', title: '', content: '' }
        }
        const st = location.state as { _id?: string } | null
        return id && st?._id === id ? st : null
    })
    const [comments, setComments] = useState<CommentType[]>([])
    const [newComment, setNewComment] = useState('')
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editBody, setEditBody] = useState('')

    useEffect(() => {
        loadSession()
        setViewerId(session.id)
        if (isNew || !id) {
            return
        }
        const st = location.state as { _id?: string } | null
        if (!(st?._id === id)) {
            getPost(id).then((res) => setPost(res.data)).catch(() => {
                setError('Could not load post.')
            })
        }
        listCommentsForPost(id).then((res) => setComments(res.data)).catch(() => {
            setComments([])
        })
    }, [id, isNew, location.state])

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
    const [commentError, setCommentError] = useState('')
    const [viewerId, setViewerId] = useState<string | null>(null)

    function reloadComments() {
        if (isNew || !id) {
            return
        }
        listCommentsForPost(id).then((res) => setComments(res.data)).catch(() => setComments([]))
    }

    function submitComment() {
        setCommentError('')
        if (!id || isNew) {
            return
        }
        loadSession()
        if (!session.id) {
            setCommentError('Sign in to add a comment.')
            return
        }
        const trimmed = newComment.trim()
        if (!trimmed) {
            return
        }
        createComment({ post_id: id, content: trimmed })
            .then(() => {
                setNewComment('')
                reloadComments()
            })
            .catch((err) => {
                setCommentError(err?.response?.data?.message || 'Could not add comment.')
            })
    }

    function startEdit(c: CommentType) {
        setEditingId(c._id)
        setEditBody(c.content)
        setCommentError('')
    }

    function saveEdit(commentId: string) {
        setCommentError('')
        loadSession()
        if (!session.id) {
            return
        }
        const trimmed = editBody.trim()
        if (!trimmed) {
            return
        }
        updateComment(commentId, { content: trimmed })
            .then(() => {
                setEditingId(null)
                reloadComments()
            })
            .catch((err) => {
                setCommentError(err?.response?.data?.message || 'Could not update comment.')
            })
    }

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
                        setError(error.response.data.message || error.response.data.error)
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
                        setError(error.response.data.message || error.response.data.error)
                    }
                }
            })
        }
    }

    if (!isNew && !post) {
        return <Box sx={{ p: 2 }}><Typography>Loading…</Typography></Box>
    }

    const isCommentOwner = (c: CommentType) =>
        viewerId != null && String(c.user_id) === String(viewerId)

    return <Box>
        <h2>{isNew ? 'Add' : 'Edit'} Post</h2>
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

        {!isNew && id ? (
            <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" sx={{ mb: 1 }}>Comments</Typography>
                <Typography color="error" sx={{ mb: 1 }}>{commentError}</Typography>
                {viewerId ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxWidth: 720, mb: 2 }}>
                        <TextField
                            label="New comment"
                            multiline
                            minRows={2}
                            fullWidth
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                        />
                        <Button variant="contained" sx={{ alignSelf: 'flex-start' }} onClick={() => submitComment()}>
                            Add comment
                        </Button>
                    </Box>
                ) : (
                    <Typography sx={{ mb: 2 }} color="text.secondary">Sign in to add a comment.</Typography>
                )}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {comments.map((c) => (
                        <Paper key={c._id} variant="outlined" sx={{ p: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                                {c.user_name}
                                {c.createdAt ? ` · ${format(parseISO(c.createdAt), 'MMM d, yyyy p')}` : ''}
                            </Typography>
                            {editingId === c._id ? (
                                <Box sx={{ mt: 1 }}>
                                    <TextField
                                        multiline
                                        minRows={2}
                                        fullWidth
                                        value={editBody}
                                        onChange={(e) => setEditBody(e.target.value)}
                                    />
                                    <Button size="small" sx={{ mt: 1, mr: 1 }} variant="contained" onClick={() => saveEdit(c._id)}>Save</Button>
                                    <Button size="small" sx={{ mt: 1 }} onClick={() => setEditingId(null)}>Cancel</Button>
                                </Box>
                            ) : (
                                <>
                                    <Typography sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>{c.content}</Typography>
                                    {isCommentOwner(c) ? (
                                        <Button size="small" sx={{ mt: 1 }} onClick={() => startEdit(c)}>Edit</Button>
                                    ) : null}
                                </>
                            )}
                        </Paper>
                    ))}
                </Box>
            </>
        ) : null}
    </Box>
}

export default PostsAddEdit
