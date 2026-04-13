import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { Box, Button, Fab, Icon, Pagination, TextField, Typography } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { listPosts } from "../services/PostsServices";
import { parseISO } from "date-fns/parseISO";
import { format } from "date-fns/format";

export type PostType = {
    _id: string,
    title: string,
    content: string,
    createdAt?: string,
    username?: string,
    user_id?: string,
}

function Posts() {

    const [posts, setPosts] = useState<PostType[]>([])
    const [filter, setFilter] = useState('')
    const [count, setCount] = useState(0)
    const [page, setPage] = useState(1)
    const pageSize = 5
    const [sort, setSort] = useState('name')
    const [dir, setDir] = useState(1)

    const navigate = useNavigate()

    useEffect(() => {
        getPosts(filter, page, sort, dir)
    }, [])

    const getPosts = (filter: string, page: number, sort: string, dir: number) => {
        listPosts({
            find: filter,
            page: page,
            pagesize: pageSize,
            sort: sort,
            sortdir: dir
        }).then(response => {
            console.log(response)
            setPosts(response.data.posts)
            setCount(response.data.totalCount)
        }).catch(error => {
            console.log(error)
        })
    }

    function PaginationLine() {
        const pages = Math.ceil((count > 0 ? count : 1) / pageSize)
        return (
            <Box sx={{ py: 1 }}>
                <Pagination
                    count={pages}
                    page={page}
                    onChange={(event, page) => {
                        setPage(page)
                        getPosts(filter, page, sort, dir)
                    }}
                    variant='outlined'
                    showFirstButton
                    showLastButton
                    sx={{ display: 'inline-block' }}
                />
                <Typography component="span" sx={{ opacity: 0.6, px: 1 }}>Page {page} of {pages}, showing {Math.min(pageSize, count)} record(s) out of {count} total</Typography>
            </Box>
        );
    }

    const handleSortChange = (accessor: string) => {
        const sortDir = accessor === sort && dir === 1 ? -1 : 1
        setSort(accessor)
        setDir(sortDir)
        setPage(1)
        getPosts(filter, 1, accessor, sortDir)
    };

    function Sort(props: any) {
        const { column, header } = props;
        return <span className='text-nowrap' onClick={() => handleSortChange(column)}>
            {header}
            <Icon sx={{ cursor: 'pointer' }}>{column !== sort ?
                "swap_vert" : dir === 1 ? "arrow_drop_down" : "arrow_drop_up"
                //"unfold_more" : dir === "ASC" ? "expand_more" : "expand_less"
            }</Icon>
        </span>
    }

    return <Box>
        <h2>Blogs</h2>
        <Button variant="outlined" onClick={() => navigate(`/blog/new`)}>New</Button>
        <TextField
            id="filter"
            label="Filter"
            variant="outlined"
            value={filter}
            onChange={event => {
                setFilter(event.target.value)
            }}
            sx={{ m: 1 }}
        />
        <Button variant="outlined" onClick={() => {
            getPosts(filter, 1, sort, dir)
            setPage(1)
        }}>Apply Filter</Button>
        <PaginationLine />
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell><Sort column="username" header="Author" /></TableCell>
                        <TableCell><Sort column="title" header="Title" /></TableCell>
                        <TableCell><Sort column="createdAt" header="Date" /></TableCell>
                        <TableCell><Sort column="content" header="Content" /></TableCell>
                        <TableCell></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {posts.map((post, index) => (
                        <TableRow
                            key={index}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell align="center">{index + 1}</TableCell>
                            <TableCell component="th" scope="row">
                                {post.username}
                            </TableCell>
                            <TableCell>{post.title}</TableCell>
                            <TableCell>{format(parseISO(post.createdAt ?? 'daya'), 'MMM d, yyyy')}</TableCell>
                            <TableCell>
                                <div dangerouslySetInnerHTML={{ __html: post.content }}></div>
                            </TableCell>
                            <TableCell>
                                <Button onClick={() => navigate(`/blog/${post._id}`, { state: post })}>Edit</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
        <PaginationLine />
        <Fab color="primary" aria-label="add" onClick={() => navigate("/blog/new")}>
            <AddIcon />
        </Fab>
    </Box>
}

export default Posts;