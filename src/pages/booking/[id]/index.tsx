import { useRouter } from "next/router";

import Container from "components/Container";
import NewBooking from "components/booking/newBooking";
import EditBooking from "components/booking/editBookingForm";
import BookingDetails from "components/booking/bookingDetails";

const BookingDetail = () => {
  const router = useRouter();
  const creatingNew = router.query.id === "new";
  const editing = router.query.edit;
  return (
    <Container>
      <div className="bg-white border border-gray-300 pt-6 pl-4 pb-4 pr-4 overflow-auto">
        {creatingNew ? (
          <NewBooking />
        ) : editing ? (
          <EditBooking />
        ) : (
          <BookingDetails />
        )}
      </div>
    </Container>
  );
};

export default BookingDetail;
