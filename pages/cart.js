import React, { useContext } from 'react';
import {
  Alert,
  Grid,
  Typography,
  Card,
  Slide,
  CircularProgress,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Select,
  MenuItem,
  Button,
  List,
  ListItem,
  Link,
} from '@mui/material';
import NextLink from 'next/link';
import { Layout } from '../components/Layout';
import getCommerce from '../utils/commerce';
import { Store } from '../components/Store';
import dynamic from 'next/dynamic';
import { CART_RETRIEVE_SUCCESS } from '../utils/constants';
import Router from 'next/router';

const Cart = (props) => {
  const { state, dispatch } = useContext(Store);
  const { cart } = state;

  const quantityChangeHandler = async (lineItem, quantity) => {
    const commerce = getCommerce(props.commercePublicKey);
    const cartData = await commerce.cart.update(lineItem.id, {
      quantity,
    });
    dispatch({ type: CART_RETRIEVE_SUCCESS, payload: cartData.cart });
  };

  const removeFromCartHandler = async (lineItem) => {
    const commerce = getCommerce(props.commercePublicKey);
    const cartData = await commerce.cart.remove(lineItem.id);
    dispatch({ type: CART_RETRIEVE_SUCCESS, payload: cartData.cart });
  };

  const processToCheckout = () => {
    Router.push('/checkout');
  };

  return (
    <Layout title="Shopping Cart" commercePublicKey={props.commercePublicKey}>
      {cart.loading ? (
        <CircularProgress />
      ) : cart.data.line_items.length === 0 ? (
        <Alert icon={false} severity="error">
          Car is empty.{' '}
          <NextLink href="/" passHref>
            <Link variant="inherit" color="#000" underline="hover">
              Go shopping
            </Link>
          </NextLink>
        </Alert>
      ) : (
        <React.Fragment>
          <Typography variant="h1" component="h1">
            Shopping Cart
          </Typography>
          <Slide direction="up" in={true}>
            <Grid container spacing={1}>
              <Grid item md={9}>
                <TableContainer>
                  <Table aria-label="Orders">
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell align="right">Quantity</TableCell>
                        <TableCell align="right">Price</TableCell>
                        <TableCell align="right">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {cart.data.line_items.map((item) => (
                        <TableRow key={item.name}>
                          <TableCell component="th" scope="row">
                            {item.name}
                          </TableCell>
                          <TableCell align="right">
                            <Select
                              labelId="quantity-label"
                              id="quantity"
                              onChange={(e) =>
                                quantityChangeHandler(item, e.target.value)
                              }
                              value={item.quantity}
                            >
                              {[...Array(10).keys()].map((x) => (
                                <MenuItem key={x + 1} value={x + 1}>
                                  {x + 1}
                                </MenuItem>
                              ))}
                            </Select>
                          </TableCell>
                          <TableCell align="right">
                            {item.price.formatted_with_symbol}
                          </TableCell>
                          <TableCell align="right">
                            <Button
                              onClick={() => removeFromCartHandler(item)}
                              variant="contained"
                              color="secondary"
                            >
                              x
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              <Grid item md={3} xs={12}>
                <Card /*styles class.card*/>
                  <List>
                    <ListItem>
                      <Grid container>
                        <Typography variant="h6">
                          Subtotal: {cart.data.subtotal.formatted_with_symbol}
                        </Typography>
                      </Grid>
                    </ListItem>
                    <ListItem>
                      {cart.data.total_items > 0 && (
                        <Button
                          type="button"
                          fullWidth
                          variant="contained"
                          color="primary"
                          onClick={processToCheckout}
                        >
                          Proceed to checkout
                        </Button>
                      )}
                    </ListItem>
                  </List>
                </Card>
              </Grid>
            </Grid>
          </Slide>
        </React.Fragment>
      )}
    </Layout>
  );
};

export default dynamic(() => Promise.resolve(Cart), {
  ssr: false,
});
