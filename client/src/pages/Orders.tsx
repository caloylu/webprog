import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { Box, Button, TextField } from "@mui/material";
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { listOrders } from "../services/OrdersServices.ts";
import { parseISO } from "date-fns/parseISO";
import { format } from "date-fns/format";

export type OrderItemType = {
    product_id?: string,
    product_name?: string,
    qty?: number,
    price?: number,
}

export type OrderType = {
    _id: string,
    user_id?: string,
    username?: string,
    status?: string,
    items?: OrderItemType[],
    total_amount?: number,
    createdAt?: string,
}

function Orders() {

    const [orders, setOrders] = useState<OrderType[]>([])
    const [filter, setFilter] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        getOrders(filter)
    }, [])

    const getOrders = (filter: string) => {
        listOrders({
            find: filter,
        }).then((response: any) => {
            console.log(response)
            setOrders(response.data)
        }).catch((error: any) => {
            console.log(error)
        })
    }

    return <Box>
        <h2>Orders</h2>
        <Button variant="outlined" onClick={() => navigate(`/orders/new`)}>New</Button>
        <TextField
            id="filter"
            label="Filter by User ID or Product"
            variant="outlined"
            value={filter}
            onChange={event => {
                setFilter(event.target.value)
            }}
            sx={{ m: 1 }}
        />
        <Button variant="outlined" onClick={() => {
            getOrders(filter)
        }}>Apply Filter</Button>
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>User</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Products</TableCell>
                        <TableCell align="right">Total</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {orders.map((order, index) => (
                        <TableRow
                            key={index}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell align="center">{index + 1}</TableCell>
                            <TableCell component="th" scope="row">
                                {order.user_id} {order.username}
                            </TableCell>
                            <TableCell>{order.status}</TableCell>
                            <TableCell>
                                <table className='orderItems'>
                                    <tbody>
                                {order.items?.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.product_name}</td>
                                        <td>{item.qty}</td>
                                        <td>{item.price}</td>
                                        <td>{(item.price ?? 0) * (item.qty ?? 0)}</td>
                                    </tr>
                                ))}
                                </tbody>    
                                </table>
                            </TableCell>
                            <TableCell align="right">{order.total_amount}</TableCell>
                            <TableCell>{order.createdAt ? format(parseISO(order.createdAt), 'MMM d, yyyy') : ''}</TableCell>
                            <TableCell>
                                <Button onClick={() => navigate(`/orders/${order._id}`, { state: order })}>Edit</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
        <Fab color="primary" aria-label="add" onClick={() => navigate('/orders/new')} sx={{ mt: 2 }}>
            <AddIcon />
        </Fab>
    </Box>
}

export default Orders