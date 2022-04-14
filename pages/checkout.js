import React, { useContext, useEffect, useState } from 'react';
import {
  Alert,
  Grid,
  Typography,
  Card,
  CircularProgress,
  Select,
  MenuItem,
  Button,
  List,
  ListItem,
  Stepper,
  Step,
  StepLabel,
  Box,
  TextField,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Layout } from '../components/Layout';
import getCommerce from '../utils/commerce';
import { Store } from '../components/Store';
import dynamic from 'next/dynamic';
import { CART_RETRIEVE_SUCCESS, ORDER_SET } from '../utils/constants';
import Router from 'next/router';

const dev = process.env.NODE_ENV === 'development';

const Checkout = (props) => {
  const { state, dispatch } = useContext(Store);
  const { cart } = state;

  useEffect(() => {
    if (!cart.loading) {
      generateCheckoutToken();
    }
  }, [cart.loading]);

  // Costumer details
  const [firstName, setFirstName] = useState(dev ? 'Jon' : '');
  const [lastName, setLastame] = useState(dev ? 'Doe' : '');
  const [email, setEmail] = useState(dev ? 'jondoe@gmail.com' : '');

  // Shipping details
  const [shippingName, setShippingName] = useState(dev ? 'Jon Doe' : '');
  const [shippingStreet, setShippingStreet] = useState(
    dev ? '123 Fake St' : ''
  );
  const [shippingPostalCode, setShippingPostalCode] = useState(
    dev ? '90089' : ''
  );
  const [shippingCity, setShippingCity] = useState(dev ? 'Los Angeles' : '');
  const [shippingStateProvince, setShippingStateProvince] = useState(
    dev ? 'AR' : ''
  );
  const [shippingCountry, setShippingCountry] = useState(dev ? 'GB' : '');
  const [shippingOption, setShippingOption] = useState({});

  // Payment and fulfillment data
  const [cardNum, setCardNum] = useState(dev ? '4242 4242 4242 4242' : '');
  const [expMonth, setExpMonth] = useState(dev ? '11' : '');
  const [expYear, setExpYear] = useState(dev ? '2023' : '');
  const [cvv, setCvv] = useState(dev ? '123' : '');
  const [billingPostalCode, setBillingPostalCode] = useState(
    dev ? '90089' : ''
  );

  const [errors, setErrors] = useState([]);
  const [checkoutToken, setCheckoutToken] = useState({});
  const [shippingOptions, setShippingOptions] = useState([]);
  const [shippingCountries, setShippingCountries] = useState([]);
  const [shippingSubdivisions, setShippingSubdivisions] = useState([]);

  // Stepper
  const [activeStep, setActiveStep] = useState(0);
  const steps = [
    'Costumer information',
    'Shipping details',
    'Payment information',
  ];

  const generateCheckoutToken = async () => {
    if (cart.data.line_items.length) {
      const commerce = getCommerce(props.commercePublicKey);
      const token = await commerce.checkout.generateToken(cart.data.id, {
        type: 'cart',
      });
      setCheckoutToken(token);
      fetchShippingCountries(token.id);
    } else {
      Router.push('/cart');
    }
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);

    if (activeStep === steps.length - 1) {
      handleCaptureCheckout();
    }
  };

  const handleCaptureCheckout = async () => {
    const orderData = {
      line_items: checkoutToken.live.line_items,
      customer: {
        firstName,
        lastName,
        email,
      },
      shipping: {
        name: shippingName,
        street: shippingStreet,
        town_city: shippingCity,
        county_state: shippingStateProvince,
        postal_zip_code: shippingPostalCode,
        country: shippingCountry,
      },
      fulfillment: {
        shipping_method: shippingOption,
      },
      payment: {
        gateway: 'test_gateway',
        card: {
          number: cardNum,
          expiry_month: expMonth,
          expiry_year: expYear,
          cvc: cvv,
          postal_zip_code: billingPostalCode,
        },
      },
    };

    const commerce = getCommerce(props.commercePublicKey);
    try {
      const order = await commerce.checkout.capture(
        checkoutToken.id,
        orderData
      );

      dispatch({ type: ORDER_SET, payload: order });
      localStorage.setItem('order_receipt', JSON.stringify(order));
      await refreshCart();
      Router.push('/confirmation');
    } catch (err) {
      const errList = [err.data.error.message];
      const errs = err.data.error.errors;

      for (const index in errs) {
        errList.push(`${index}: ${errs[index]}`);
      }

      setErrors(errList);
    }
  };

  const refreshCart = async () => {
    const commerce = getCommerce(props.commercePublicKey);
    const newCart = await commerce.cart.refresh();
    dispatch({ type: CART_RETRIEVE_SUCCESS, payload: newCart });
  };

  const handleBack = () => {
    setErrors([]);
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleShippingCountryChange = (e) => {
    const currentValue = e.target.value;
    setShippingCountry(currentValue);
    fetchSubdivisions(currentValue);
  };

  const fetchShippingCountries = async (checkoutTokenId) => {
    const commerce = getCommerce(props.commercePublicKey);
    const countries = await commerce.services.localeListShippingCountries(
      checkoutTokenId
    );
    setShippingCountries(countries.countries);
  };

  const fetchSubdivisions = async (countryCode) => {
    const commerce = getCommerce(props.commercePublicKey);
    const subdivisions = await commerce.services.localeListSubdivisions(
      countryCode
    );
    setShippingSubdivisions(subdivisions.subdivisions);
  };

  const handleSubdivisionChange = (e) => {
    const currentValue = e.target.value;
    setShippingStateProvince(currentValue);
    fetchShippingOptions(checkoutToken.id, shippingCountry, currentValue);
  };

  const handleShippingOptionChange = (e) => {
    const currentValue = e.target.value;
    setShippingOption(currentValue);
    console.log(currentValue);
  };

  const fetchShippingOptions = async (
    checkoutTokenId,
    country,
    stateProvince = null
  ) => {
    const commerce = getCommerce(props.commercePublicKey);
    const options = await commerce.checkout.getShippingOptions(
      checkoutTokenId,
      {
        country,
        region: stateProvince,
      }
    );
    setShippingOptions(options);
    setShippingOption(options[0] ? options[0].id : null);
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="firstName"
              label="First Name"
              name="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="lastName"
              label="Last Name"
              name="lastName"
              value={lastName}
              onChange={(e) => setLastame(e.target.value)}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </>
        );
      case 1:
        return (
          <>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="shippingName"
              label="Full Name"
              name="name"
              value={shippingName}
              onChange={(e) => setShippingName(e.target.value)}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="shippingCity"
              label="City"
              name="city"
              value={shippingCity}
              onChange={(e) => setShippingCity(e.target.value)}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="shippingStreet"
              label="Street"
              name="address"
              value={shippingStreet}
              onChange={(e) => setShippingStreet(e.target.value)}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="shippingPostalCode"
              label="Postal/Zip Code"
              name="postalCode"
              value={shippingPostalCode}
              onChange={(e) => setShippingPostalCode(e.target.value)}
            />
            <FormControl
              sx={{
                marginTop: '1rem !important',
                minWidth: 120,
                width: '100%',
              }}
            >
              <InputLabel id="shippingCountry-label">Country</InputLabel>
              <Select
                labelId="shippingCountry-label"
                id="shippingCountry"
                label="Country"
                fullWidth
                onChange={handleShippingCountryChange}
                value={shippingCountry}
                required
              >
                {Object.keys(shippingCountries).map((index) => (
                  <MenuItem value={index} key={index}>
                    {shippingCountries[index]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl
              sx={{
                marginTop: '1rem !important',
                minWidth: 120,
                width: '100%',
              }}
            >
              <InputLabel id="shippingStateProvince-label">
                State / Province
              </InputLabel>
              <Select
                labelId="shippingStateProvince-label"
                id="shippingStateProvince"
                label="State/Province"
                fullWidth
                onChange={handleSubdivisionChange}
                value={shippingStateProvince}
                required
                sx={{ marginTop: '1rem !important' }}
              >
                {Object.keys(shippingSubdivisions).map((index) => (
                  <MenuItem value={index} key={index}>
                    {shippingSubdivisions[index]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl
              sx={{
                marginTop: '1rem !important',
                minWidth: 120,
                width: '100%',
              }}
            >
              <InputLabel id="shippingOption-label">Shipping Option</InputLabel>
              <Select
                labelId="shippingOption-label"
                id="shippingOption"
                label="Shipping Option"
                fullWidth
                onChange={handleShippingOptionChange}
                value={shippingOption}
                required
                sx={{ marginTop: '1rem !important' }}
              >
                {shippingOptions.map((method, index) => (
                  <MenuItem value={method.id} key={index}>
                    {`${method.description} - $${method.price.formatted_with_code}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        );
      case 2:
        return (
          <>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="cardNum"
              label="Card Number"
              name="cardNum"
              value={cardNum}
              onChange={(e) => setCardNum(e.target.value)}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="expMonth"
              label="Expiry Month"
              name="expMonth"
              value={expMonth}
              onChange={(e) => setExpMonth(e.target.value)}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="expYear"
              label="Expiry Year"
              name="expYear"
              value={expYear}
              onChange={(e) => setExpYear(e.target.value)}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="cvv"
              label="CVV"
              name="cvv"
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="billingPostalZipcode"
              label="Postal/Zip Code"
              name="postalCode"
              value={billingPostalCode}
              onChange={(e) => setBillingPostalCode(e.target.value)}
            />
          </>
        );
      default:
        return 'Unknown Step';
    }
  };

  return (
    <Layout title="Checkout" commercePublicKey={props.commercePublicKey}>
      <Typography gutterBottom variant="h6" color="textPrimary" component="h1">
        Checkout
      </Typography>
      {cart.loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={2}>
          <Grid item md={8}>
            <Card sx={{ padding: '15px' }}>
              <form>
                <Stepper activeStep={activeStep} alternativeLabel>
                  {steps.map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
                <Box>
                  {activeStep === steps.length ? (
                    errors && errors.length > 0 ? (
                      <Box>
                        <List>
                          {errors.map((error) => (
                            <ListItem key={error}>
                              <Alert severity="error">{error}</Alert>
                            </ListItem>
                          ))}
                        </List>
                        <Box sx={{ marginTop: '1rem !important' }}>
                          <Button onClick={handleBack}>Back</Button>
                        </Box>
                      </Box>
                    ) : (
                      <Box>
                        <CircularProgress />
                        <Typography>Confirming Order...</Typography>
                      </Box>
                    )
                  ) : (
                    <Box>
                      {getStepContent(activeStep)}
                      <Box>
                        <Button
                          disabled={activeStep === 0}
                          onClick={handleBack}
                          sx={{ margin: '15px 0 15px 15px' }}
                        >
                          Back
                        </Button>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleNext}
                          sx={{ margin: '15px 0 15px 10px' }}
                        >
                          {activeStep === steps.length - 1
                            ? 'Confirm Order'
                            : 'Next'}
                        </Button>
                      </Box>
                    </Box>
                  )}
                </Box>
              </form>
            </Card>
          </Grid>
          <Grid item md={4}>
            <Card>
              <List>
                <ListItem>
                  <Typography variant="h2">Order summary</Typography>
                </ListItem>
                {cart.data.line_items.map((item) => (
                  <ListItem key={item.id}>
                    <Grid container>
                      <Grid xs={6} item>
                        {item.quantity} x {item.name}
                      </Grid>
                      <Grid xs={6} item>
                        <Typography align="right">
                          {item.line_total.formatted_with_symbol}
                        </Typography>
                      </Grid>
                    </Grid>
                  </ListItem>
                ))}
                <ListItem>
                  <Grid container>
                    <Grid xs={6} item>
                      Subtotal
                    </Grid>
                  </Grid>
                  <Grid xs={6} item>
                    <Typography align="right">
                      {cart.data.subtotal.formatted_with_symbol}
                    </Typography>
                  </Grid>
                </ListItem>
              </List>
            </Card>
          </Grid>
        </Grid>
      )}
    </Layout>
  );
};

export default dynamic(() => Promise.resolve(Checkout), {
  ssr: false,
});
