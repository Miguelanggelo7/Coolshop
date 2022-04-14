import {
  Alert,
  Box,
  Grid,
  Typography,
  Card,
  Slide,
  List,
  ListItem,
  Select,
  MenuItem,
  Button,
} from '@mui/material';
import Image from 'next/image';
import { useContext, useState } from 'react';
import { Layout } from '../../components/Layout';
import { Store } from '../../components/Store';
import getCommerce from '../../utils/commerce';
import { CART_RETRIEVE_SUCCESS } from '../../utils/constants';
import Router from 'next/router';

const Product = (props) => {
  const { product } = props;
  const [quantity, setQuantity] = useState(1);

  const { state, dispatch } = useContext(Store);
  const { cart } = state;

  const addToCartHandler = async () => {
    const commerce = getCommerce(props.commercePublicKey);
    const lineItem = cart.data.line_items.find((x) => x.id === product.id);
    if (lineItem) {
      // The product is already in the cart so it update the quantity
      const cartData = await commerce.cart.update(lineItem.id, {
        quantity: quantity,
      });

      dispatch({ type: CART_RETRIEVE_SUCCESS, payload: cartData.cart });
      Router.push('/cart');
    } else {
      const cartData = await commerce.cart.add(product.id, quantity);
      dispatch({ type: CART_RETRIEVE_SUCCESS, payload: cartData.cart });
      Router.push('/cart');
    }
  };

  return (
    <Layout title={product.name}>
      <Slide direction="up" in={true}>
        <Grid container spacing={1}>
          <Grid item md={6}>
            <Image
              src={product.image.url}
              alt={product.name}
              height={500}
              width={350}
            />
          </Grid>
          <Grid item md={3} xs={12}>
            <List>
              <ListItem>
                <Typography
                  gutterBottom
                  variant="h6"
                  color="textPrimary"
                  component="h1"
                >
                  {product.name}
                </Typography>
              </ListItem>
              <ListItem>
                <Box
                  dangerouslySetInnerHTML={{ __html: product.description }}
                ></Box>
              </ListItem>
            </List>
          </Grid>
          <Grid item md={3} xs={12}>
            <Card>
              <List>
                <ListItem>
                  <Grid container>
                    <Grid item xs={6}>
                      Price
                    </Grid>
                    <Grid item xs={6}>
                      {product.price.formatted_with_symbol}
                    </Grid>
                  </Grid>
                </ListItem>
                <ListItem>
                  <Grid alignItems="center" container>
                    <Grid item xs={6}>
                      Status
                    </Grid>
                    <Grid item xs={6}>
                      {product.inventory.available > 0 ? (
                        <Alert icon={false} severity="success">
                          In Stock
                        </Alert>
                      ) : (
                        <Alert icon={false} severity="error">
                          Unavailable
                        </Alert>
                      )}
                    </Grid>
                  </Grid>
                </ListItem>
                {product.inventory.available > 0 && (
                  <>
                    <ListItem>
                      <Grid container justify="flex-end">
                        <Grid item xs={6}>
                          Quantity
                        </Grid>
                        <Grid item xs={6}>
                          <Select
                            labelId="quantity-label"
                            id="quantity"
                            fullWidth
                            onChange={(e) => setQuantity(e.target.value)}
                            value={quantity}
                          >
                            {[...Array(product.inventory.available).keys()].map(
                              (x) => (
                                <MenuItem key={x + 1} value={x + 1}>
                                  {x + 1}
                                </MenuItem>
                              )
                            )}
                          </Select>
                        </Grid>
                      </Grid>
                    </ListItem>
                    <ListItem>
                      <Button
                        type="button"
                        fullWidth
                        variant="contained"
                        color="primary"
                        onClick={addToCartHandler}
                      >
                        Add to Cart
                      </Button>
                    </ListItem>
                  </>
                )}
              </List>
            </Card>
          </Grid>
        </Grid>
      </Slide>
    </Layout>
  );
};

export default Product;

export async function getServerSideProps({ params }) {
  const { id } = params;
  const commerce = getCommerce();
  const product = await commerce.products.retrieve(id, {
    type: 'permalink',
  });
  return {
    props: {
      product,
    },
  };
}
