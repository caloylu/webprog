import { useEffect, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router"

import { Box, Button, IconButton, MenuItem, TextField, Typography } from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import AddIcon from "@mui/icons-material/Add"
import { createOrder, getOrder, updateOrder } from "../services/OrdersServices.ts"
import { listProducts } from "../services/ProductsServices"
import { session } from "../auth/Session.ts"

type ProductType = {
    _id: string
    name: string
    price: number
}

type OrderItemFormType = {
    product_id: string
    qty: number
}

type OrderFormType = {
    _id?: string
    user_id: string
    status: string
    items: OrderItemFormType[]
}

const emptyOrder: OrderFormType = {
    user_id: "",
    status: "New",
    items: [{ product_id: "", qty: 1 }]
}

const statusOptions = ["New", "Posted", "Processing", "Processed", "Canceled"]

function OrdersAddEdit() {
    const { id } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const isNew = id === "new"

    const [products, setProducts] = useState<ProductType[]>([])
    const [order, setOrder] = useState<OrderFormType>(() => {
        if (isNew) {
            return emptyOrder
        }

        const stateOrder = location.state as any
        if (stateOrder) {
            return {
                _id: stateOrder._id,
                user_id: session.id ?? "",
                status: stateOrder.status ?? "New",
                items: (stateOrder.items ?? []).map((item: any) => ({
                    product_id: item.product_id ?? "",
                    qty: item.qty ?? 1,
                }))
            }
        }

        return emptyOrder
    })

    const [error, setError] = useState("")

    useEffect(() => {
        listProducts({ page: 1, pagesize: 1000 }).then((response: any) => {
            setProducts(response.data?.products ?? [])
        }).catch((err: any) => {
            console.log(err)
        })

        if (!isNew && !location.state && id) {
            getOrder(id).then((response: any) => {
                const loadedOrder = response.data
                setOrder({
                    _id: loadedOrder._id,
                    user_id: session.id ?? "",
                    status: loadedOrder.status ?? "New",
                    items: (loadedOrder.items ?? []).map((item: any) => ({
                        product_id: item.product_id ?? "",
                        qty: item.qty ?? 1,
                    }))
                })
            }).catch((err: any) => {
                console.log(err)
                setError("Unable to load order")
            })
        }
    }, [])

    const getItemPrice = (productId: string) => {
        const product = products.find((p) => p._id === productId)
        return product?.price ?? 0
    }

    const totalAmount = order.items.reduce((sum, item) => sum + item.qty * getItemPrice(item.product_id), 0)

    const addItem = () => {
        setOrder({
            ...order,
            items: [...order.items, { product_id: "", qty: 1 }]
        })
    }

    const removeItem = (index: number) => {
        const nextItems = order.items.filter((_, i) => i !== index)
        setOrder({
            ...order,
            items: nextItems.length > 0 ? nextItems : [{ product_id: "", qty: 1 }]
        })
    }

    const updateItem = (index: number, patch: Partial<OrderItemFormType>) => {
        setOrder({
            ...order,
            items: order.items.map((item, i) => {
                if (i !== index) {
                    return item
                }
                return {
                    ...item,
                    ...patch
                }
            })
        })
    }

    const validate = () => {
        if (order.items.length === 0) {
            setError("At least one product is required")
            return false
        }

        for (const item of order.items) {
            if (!item.product_id) {
                setError("Each row must have a product")
                return false
            }
            if (!item.qty || item.qty < 1) {
                setError("Quantity must be at least 1")
                return false
            }
        }

        return true
    }

    const save = () => {
        setError("")
        if (!validate()) {
            return
        }

        const payload = {
            user_id: session.id,
            status: order.status,
            items: order.items.map((item) => ({
                product_id: item.product_id,
                qty: Number(item.qty)
            })),
            total_amount: totalAmount,
        }

        if (isNew) {
            createOrder(payload).then(() => {
                navigate("/orders")
            }).catch((err: any) => {
                console.log(err)
                setError(err?.response?.data?.message ?? "Unable to create order")
            })
            return
        }

        if (!order._id) {
            setError("Missing order id")
            return
        }

        updateOrder(order._id, payload).then(() => {
            navigate("/orders")
        }).catch((err: any) => {
            console.log(err)
            setError(err?.response?.data?.message ?? "Unable to update order")
        })
    }

    return <Box>
        <h2>{isNew ? "Add" : "Edit"} Order</h2>

        <TextField
            select
            id="status"
            fullWidth
            label="Status"
            value={order.status}
            onChange={(event) => {
                setOrder({ ...order, status: event.target.value })
            }}
            sx={{ m: 1 }}
        >
            {statusOptions.map((status) => (
                <MenuItem key={status} value={status}>{status}</MenuItem>
            ))}
        </TextField>

        <Typography sx={{ px: 1, pt: 1 }} variant="h6">Products in Order</Typography>
        {order.items.map((item, index) => (
            <Box key={index} sx={{ display: "flex", gap: 1, alignItems: "center", m: 1 }}>
                <TextField
                    select
                    fullWidth
                    label="Product"
                    value={item.product_id}
                    onChange={(event) => {
                        updateItem(index, { product_id: event.target.value })
                    }}
                >
                    {products.map((product) => (
                        <MenuItem key={product._id} value={product._id}>{product.name}</MenuItem>
                    ))}
                </TextField>
                <TextField
                    type="number"
                    label="Qty"
                    value={item.qty}
                    onChange={(event) => {
                        updateItem(index, { qty: Number(event.target.value) })
                    }}
                    sx={{ width: 120 }}
                    inputProps={{ min: 1 }}
                />
                <TextField
                    label="Price"
                    value={getItemPrice(item.product_id)}
                    sx={{ width: 140 }}
                    InputProps={{ readOnly: true }}
                />
                <IconButton color="error" onClick={() => removeItem(index)}>
                    <DeleteIcon />
                </IconButton>
            </Box>
        ))}

        <Button startIcon={<AddIcon />} variant="outlined" sx={{ m: 1 }} onClick={addItem}>
            Add Product
        </Button>

        <Typography sx={{ px: 1, pt: 1 }}>Total Amount: {totalAmount}</Typography>
        <Typography sx={{ px: 1 }} color="error">{error}</Typography>

        <Button variant="outlined" sx={{ m: 1 }} onClick={() => navigate('/orders')}>
            Cancel
        </Button>
        <Button variant="contained" sx={{ m: 1 }} onClick={save}>
            Save
        </Button>
    </Box>
}

export default OrdersAddEdit
