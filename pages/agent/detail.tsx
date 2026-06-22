import { GetServerSideProps, NextPage } from 'next';

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
	const agentId = Array.isArray(query.agentId) ? query.agentId[0] : query.agentId;

	return {
		redirect: {
			destination: agentId ? `/member?memberId=${agentId}&category=pharmacies` : '/agent',
			permanent: true,
		},
	};
};

const AgentDetailRedirect: NextPage = () => null;

export default AgentDetailRedirect;
