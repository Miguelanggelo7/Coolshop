import {
  AppBar,
  Toolbar,
  Link,
  Container,
  Box,
  Typography,
  CircularProgress,
  Badge,
} from '@mui/material';
import Head from 'next/head';
import NextLink from 'next/link';
import React, { useContext, useEffect } from 'react';
import getCommerce from '../utils/commerce';
import {
  CART_RETRIEVE_REQUEST,
  CART_RETRIEVE_SUCCESS,
} from '../utils/constants';
import { Store } from './Store';

export const Layout = ({ children, commercePublicKey, title = 'Coolshop' }) => {
  const { state, dispatch } = useContext(Store);
  const { cart } = state;

  useEffect(() => {
    const fetchCart = async () => {
      const commerce = getCommerce(commercePublicKey);
      dispatch({ type: CART_RETRIEVE_REQUEST });
      const cartData = await commerce.cart.retrieve();
      dispatch({ type: CART_RETRIEVE_SUCCESS, payload: cartData });
    };

    fetchCart();
  }, []);

  return (
    <React.Fragment>
      <Head>
        <meta charSet="utf-8" />
        <title>{`${title} - Coolshop`}</title>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
      </Head>
      <AppBar
        sx={{
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          marginBottom: '2.5rem',
        }}
        position="static"
        color="default"
        elevation={0}
      >
        <Toolbar sx={{ flexWrap: 'wrap' }}>
          <NextLink href="/" passHref>
            <Link
              variant="h6"
              color="inherit"
              noWrap
              href="/"
              sx={{ flexGrow: 1 }}
              underline="hover"
            >
              Coolshop
            </Link>
          </NextLink>
          <nav>
            <NextLink href="/cart" passHref>
              <Link
                variant="button"
                color="textPrimary"
                href="/cart"
                underline="hover"
              >
                {cart.loading ? (
                  <CircularProgress />
                ) : cart.data.total_items > 0 ? (
                  <Badge badgeContent={cart.data.total_items} color="primary">
                    Cart
                  </Badge>
                ) : (
                  'Cart'
                )}
              </Link>
            </NextLink>
          </nav>
        </Toolbar>
      </AppBar>
      <Container component="main">{children}</Container>
      <Container maxWidth="md" component="footer">
        <Box mt={5}>
          <Typography variant="body2" color="textSecondary" align="center">
            {'© '}
            Coolshop 2022
            {'.'}
          </Typography>
        </Box>
      </Container>
    </React.Fragment>
  );
};
