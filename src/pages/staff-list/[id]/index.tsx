import { useRouter } from "next/router";

import Container from "components/Container";
import StaffMemberForm from "components/staff-member/staffMemberForm";
import StaffMemberDetail from "components/staff-member/staffMemberDetail";

const StaffMember = () => {
  const router = useRouter();
  const creatingNew = router.query.id === "new";
  const editing = router.query.edit;

  return (
    <Container>
      <div className="bg-white border border-gray-300 pt-6 pl-4 pb-4 pr-4 relative">
        {router.query.id && (
          <>
            {creatingNew || editing ? (
              <StaffMemberForm />
            ) : (
              <StaffMemberDetail />
            )}
          </>
        )}
      </div>
    </Container>
  );
};
export default StaffMember;
