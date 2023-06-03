import { useRouter } from 'next/router';

import Container from 'components/Container';
import CustomerDetails from 'components/customer/customerDetails';

const CustomerDetail = () => {
  // const router = useRouter();
  // const creatingNew = router.query.id === 'new';

  return (
    <Container>
      <div className="bg-white border border-gray-300 pt-6 pl-4 pb-4 pr-4">
        <CustomerDetails />
      </div>
    </Container>
  );
};

export default CustomerDetail;
