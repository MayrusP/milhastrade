import { Link } from 'react-router-dom';
import { Layout } from '../components/common/Layout';
import { useAuth } from '../hooks/useAuthSimple.tsx';

export const HomePage = () => {
    const { isAuthenticated, user } = useAuth();

    return (
        <Layout>
            {/* Hero Section */}
            <div className="bg-white">
                <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        {isAuthenticated ? (
                            <>
                                <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                                    <span className="block">Bem-vindo, {user?.name.split(' ')[0]}!</span>
                                    <span className="block text-primary-600">Compre e venda milhas</span>
                                </h1>
                                <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                                    Explore as melhores ofertas de milhas aéreas ou crie suas próprias ofertas.
                                    Sua jornada de negociação começa aqui!
                                </p>
                                <div className="mt-5 max-w-md mx-auto flex justify-center md:mt-8">
                                    <div className="rounded-md shadow">
                                        <Link
                                            to="/marketplace"
                                            className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10"
                                        >
                                            Explorar Ofertas
                                        </Link>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                                    <span className="block">Compre e venda</span>
                                    <span className="block text-primary-600">milhas aéreas</span>
                                </h1>
                                <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                                    A plataforma mais segura para negociar milhas aéreas. Conecte-se com outros usuários e
                                    encontre as melhores ofertas do mercado.
                                </p>
                                <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                                    <div className="rounded-md shadow">
                                        <Link
                                            to="/register"
                                            className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10"
                                        >
                                            Cadastrar Grátis
                                        </Link>
                                    </div>
                                    <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                                        <Link
                                            to="/login"
                                            className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                                        >
                                            Fazer Login
                                        </Link>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions for Authenticated Users */}
            {isAuthenticated && (
                <div className="py-12 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-900">Ações Rápidas</h2>
                            <p className="mt-2 text-gray-600">Gerencie suas milhas de forma eficiente</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Link
                                to="/profile"
                                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center"
                            >
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Meu Perfil</h3>
                                <p className="text-gray-600">Gerencie sua conta e créditos</p>
                            </Link>

                            <Link
                                to="/dashboard"
                                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center"
                            >
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Dashboard</h3>
                                <p className="text-gray-600">Veja suas estatísticas e atividades</p>
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Features Section */}
            <div className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold text-gray-900">
                            Como funciona
                        </h2>
                        <p className="mt-4 text-lg text-gray-600">
                            Simples, seguro e eficiente
                        </p>
                    </div>

                    <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="text-center">
                            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mx-auto">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h3 className="mt-4 text-lg font-medium text-gray-900">1. Cadastre-se</h3>
                            <p className="mt-2 text-base text-gray-500">
                                Crie sua conta gratuita em poucos minutos
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mx-auto">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <h3 className="mt-4 text-lg font-medium text-gray-900">2. Explore</h3>
                            <p className="mt-2 text-base text-gray-500">
                                Encontre as melhores ofertas ou publique a sua
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mx-auto">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="mt-4 text-lg font-medium text-gray-900">3. Negocie</h3>
                            <p className="mt-2 text-base text-gray-500">
                                Conclua a transação de forma segura
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="bg-primary-600">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:py-16 sm:px-6 lg:px-8 lg:py-20">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                            Confiado por milhares de usuários
                        </h2>
                        <p className="mt-3 text-xl text-primary-200 sm:mt-4">
                            Junte-se à maior comunidade de negociação de milhas do Brasil
                        </p>
                    </div>
                    <dl className="mt-10 text-center sm:max-w-3xl sm:mx-auto sm:grid sm:grid-cols-3 sm:gap-8">
                        <div className="flex flex-col">
                            <dt className="order-2 mt-2 text-lg leading-6 font-medium text-primary-200">
                                Ofertas ativas
                            </dt>
                            <dd className="order-1 text-5xl font-extrabold text-white">
                                500+
                            </dd>
                        </div>
                        <div className="flex flex-col mt-10 sm:mt-0">
                            <dt className="order-2 mt-2 text-lg leading-6 font-medium text-primary-200">
                                Usuários cadastrados
                            </dt>
                            <dd className="order-1 text-5xl font-extrabold text-white">
                                2K+
                            </dd>
                        </div>
                        <div className="flex flex-col mt-10 sm:mt-0">
                            <dt className="order-2 mt-2 text-lg leading-6 font-medium text-primary-200">
                                Transações realizadas
                            </dt>
                            <dd className="order-1 text-5xl font-extrabold text-white">
                                1K+
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>
        </Layout>
    );
};