import { useRouter } from "next/router";

import Container from "components/Container";
import NewBooking from "components/booking/newBooking";
import BookingDetails from "components/booking/bookingDetails";

const BookingDetail = () => {
  const router = useRouter();
  const creatingNew = router.query.id === "new";

  return (
    <Container>
      <div className="bg-white border border-gray-300 pt-6 pl-4 pb-4 pr-4">
        {creatingNew ? <NewBooking /> : <BookingDetails />}
      </div>
    </Container>
  );
};

export default BookingDetail;
