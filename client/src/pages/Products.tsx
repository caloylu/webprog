import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { Box, Button, Fab, Icon, Pagination, TextField, Typography } from "@mui/material";
import { loadSession, session, subscribeSession } from "../auth/Session";
import AddIcon from '@mui/icons-material/Add';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import { listProducts, productImageUrl } from "../services/ProductsServices";

export type ProductType = {
    _id: string,
    name: string,
    description: string,
    price: number,
    qty: number,
    imageUrl?: string | null,
}

function Products() {

    const [products, setProducts] = useState<ProductType[]>([])
    const [filter, setFilter] = useState('')
    const [count, setCount] = useState(0)
    const [page, setPage] = useState(1)
    const pageSize = 5
    const [sort, setSort] = useState('name')
    const [dir, setDir] = useState(1)
    const [isAdmin, setIsAdmin] = useState(false)

    const navigate = useNavigate()

    useEffect(() => {
        loadSession()
        setIsAdmin(session.userType === 'admin')
        const unsubscribe = subscribeSession(() => setIsAdmin(session.userType === 'admin'))
        getProducts(filter, page, sort, dir)
        return unsubscribe
    }, [])

    const getProducts = (filter: string, page: number, sort: string, dir: number) => {
        listProducts({
            find: filter,
            page: page,
            pagesize: pageSize,
            sort: sort,
            sortdir: dir
        }).then(response => {
            console.log(response)
            setProducts(response.data.products)
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
                    onChange={(_event, page) => {
                        setPage(page)
                        getProducts(filter, page, sort, dir)
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
        getProducts(filter, 1, accessor, sortDir)
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
        <h2>Products</h2>
        {isAdmin ? (
            <Button variant="outlined" onClick={() => navigate(`/products/new`)}>New</Button>
        ) : (
            <Typography sx={{ mb: 1, color: 'text.secondary' }}>Only admins can add or update products.</Typography>
        )}
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
            getProducts(filter, 1, sort, dir)
            setPage(1)
        }}>Apply Filter</Button>
        <PaginationLine />
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Image</TableCell>
                        <TableCell><Sort column="name" header="Name" /></TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell align="right"><Sort column="price" header="Price" /></TableCell>
                        <TableCell align="right"><Sort column="qty" header="Quantity" /></TableCell>
                        <TableCell></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {products?.map((product, index) => (
                        <TableRow
                            key={index}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell align="center">{index + 1}</TableCell>
                            <TableCell sx={{ width: 88 }}>
                                {productImageUrl(product.imageUrl) ? (
                                    <Box
                                        component="img"
                                        src={productImageUrl(product.imageUrl)}
                                        alt={product.name}
                                        sx={{ width: 72, height: 72, objectFit: "contain", display: "block", borderRadius: 1, bgcolor: "action.hover" }}
                                    />
                                ) : (
                                    <Typography variant="caption" color="text.secondary">—</Typography>
                                )}
                            </TableCell>
                            <TableCell component="th" scope="row">
                                {product.name}
                            </TableCell>
                            <TableCell><div dangerouslySetInnerHTML={{ __html: product.description }}></div></TableCell>
                            <TableCell align="right">{product.price}</TableCell>
                            <TableCell align="right">{product.qty}</TableCell>
                            <TableCell>
                                {isAdmin ? (
                                    <Button onClick={() => navigate(`/products/${product._id}`, { state: product })}>Edit</Button>
                                ) : null}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
        <PaginationLine />
        <Fab color="primary" aria-label="add" onClick={() => navigate("/products/new")}>
            <AddIcon />
        </Fab>
    </Box>
}

export default Products;