import {
  Card,
  Stack,
  Image,
  Heading,
  Text,
  Divider,
  ButtonGroup,
  Button,
  CardBody,
  CardFooter,
} from '@chakra-ui/react';
import propTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

export default function NftCollection({ name, owner, nftAddress }) {
  const nav = useNavigate();
  return (
    <>
      <Card maxW="sm">
        <CardBody onClick={() => nav('/collection/' + nftAddress)} cursor="pointer">
          <Image src="" alt="" borderRadius="lg" />
          <Stack mt="6" spacing="3">
            <Heading size="md">{name}</Heading>
            <Text>owner: {owner}</Text>
            <Text color="blue.600" fontSize="2xl">
              contract address: {nftAddress}
            </Text>
          </Stack>
        </CardBody>
        {/* <Divider />
      <CardFooter>
        <ButtonGroup spacing="2">
          <Button variant="solid" colorScheme="blue">
            Buy now
          </Button>
          <Button variant="ghost" colorScheme="blue">
            Add to cart
          </Button>
        </ButtonGroup>
      </CardFooter> */}
      </Card>
    </>
  );
}

NftCollection.propTypes = {
  name: propTypes.string.isRequired,
  owner: propTypes.string.isRequired,
  nftAddress: propTypes.string.isRequired,
};
