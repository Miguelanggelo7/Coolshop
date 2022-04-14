import React from 'react';
import {
  Alert,
  Box,
  CardActionArea,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  Card,
  Slide,
} from '@mui/material';
import Link from 'next/link';
import { Layout } from '../components/Layout';
import getCommerce from '../utils/commerce';

export default function Home(props) {
  const { products } = props;

  return (
    <Layout title="Home" commercePublicKey={props.commercePublicKey}>
      {products.lenght === 0 && <Alert>No product found</Alert>}
      <Grid container spacing={1}>
        {products &&
          products.map((product) => (
            <Grid item md={3} key={product.id}>
              <Slide direction="up" in={true}>
                <Card sx={{ height: '100%' }}>
                  <Link href={`/products/${product.permalink}`} passHref>
                    <CardActionArea>
                      <CardMedia
                        component="img"
                        alt={product.name}
                        image={product.image.url}
                        sx={{
                          maxWidth: '50rem',
                          width: '100%',
                          maxHeight: '25rem',
                        }}
                      />
                      <CardContent>
                        <Typography
                          gutterBottom
                          variant="body2"
                          color="textPrimary"
                          component="p"
                          sx={{ textDecoration: 'none' }}
                        >
                          {product.name}
                        </Typography>
                        <Box>
                          <Typography
                            variant="body1"
                            color="textPrimary"
                            component="p"
                          >
                            {product.price.formatted_with_symbol}
                          </Typography>
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Link>
                </Card>
              </Slide>
            </Grid>
          ))}
      </Grid>
    </Layout>
  );
}

export async function getStaticProps() {
  const commerce = getCommerce();
  const { data: products } = await commerce.products.list();

  return {
    props: {
      products,
    },
  };
}
