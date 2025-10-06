import type { FC } from "react";
import type { Committee } from "../interfaces/Committee";
import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import CommitteeModal from "../components/CommitteeModal";
import { committees as localCommittees } from "../config/committees";
import { FirestoreService } from "../firebase/firestore";
import Loader from "../components/Loader";

const CommitteesView: FC = () => {
  const [committeesInfo, setCommittees] = useState<Committee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCommittee, setSelectedCommittee] = useState<Committee | null>(
    null
  );

  const fetchCommittees = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await FirestoreService.getAll<Committee>("committees");
      console.log(data);
      setCommittees(data.length > 0 ? data : localCommittees);
    } catch (error) {
      console.error("Error fetching committees:", error);
      setCommittees(localCommittees);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCommittees();
  }, [fetchCommittees]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <section className="text-[#f0f0f0] w-[90%] min-h-[100vh] sm:pt-32 flex justify-center">
        <div className="w-full max-w-[1200px] px-4">
          <h2 className="sm:text-[3.5em] text-[2.5em] my-4 font-montserrat-bold transition-all duration-500 ease-in-out">
            Comités
          </h2>
          <div className="grid grid-cols-1 my-8 md:grid-cols-2 gap-8">
            {committeesInfo.map((committee) => (
              <div
                key={committee.name}
                className={`bg-glass p-2 rounded-lg overflow-hidden shadow-lg cursor-pointer transition-transform hover:scale-105`}
                onClick={() => setSelectedCommittee(committee)}
              >
                <img
                  src={committee.img}
                  alt={committee.name}
                  className="w-full h-48 object-contain"
                />
                <div className="p-4">
                  <h3 className="text-lg font-montserrat-bold mb-2">
                    {committee.name}
                  </h3>
                  <p className="text-xs font-montserrat-light">
                    {committee.topic}
                  </p>
                  <p className="text-xs font-montserrat-bold">
                    Cupos: {committee.seats}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {selectedCommittee && (
          <motion.div
            className="text-[#f0f0f0] fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <CommitteeModal
              committee={selectedCommittee}
              onClose={() => setSelectedCommittee(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CommitteesView;
