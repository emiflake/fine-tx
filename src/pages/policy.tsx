import { useParams } from 'react-router';
import { NavBar } from '../components/nav';
import { useMemo } from 'react';
import {
  ClipboardButton,
  LinkClipboardButton,
} from '../components/ActionButtons';
import {
  AssetHistory,
  AssetTransaction,
  useAssetHistory,
  useAssetTransactions,
} from '../betterfrost';
import { ShimmerBox } from '../components/tx';
import { ErrorBox } from '../App';
import { MiniTransactionCard } from '../components/MiniTx';

const ViewAssetTransactions = ({
  assetTransactions,
  isLoading,
  isError,
}: {
  assetTransactions: AssetTransaction[] | undefined;
  isLoading: boolean;
  isError: boolean;
}) => {
  return (
    <>
      {assetTransactions && (
        <>
          <span className="text-md dark:text-white">Transactions</span>
          {assetTransactions && (
            <span className="text-xs dark:text-gray-300">
              Count: {assetTransactions.length}
            </span>
          )}
          <div className="grid grid-cols-1 gap-3 mt-2">
            {assetTransactions?.map(
              (transaction) =>
                transaction.tx_hash && (
                  <MiniTransactionCard
                    key={transaction.tx_hash}
                    txHash={transaction.tx_hash}
                  />
                ),
            )}
          </div>
        </>
      )}
      {isLoading && <ShimmerBox />}
      {isError && <ErrorBox message={'Could not load transactions'} />}
    </>
  );
};

const ViewAssetHistory = ({
  assetHistory,
  isLoading,
  isError,
}: {
  assetHistory: AssetHistory[] | undefined;
  isLoading: boolean;
  isError: boolean;
}) => {
  const displayHistory = assetHistory;
  return (
    <>
      {displayHistory && (
        <>
          <span className="text-md dark:text-white">Token History</span>
          <span className="text-xs dark:text-gray-300">
            Count: {displayHistory.length}
          </span>
          <div className="space-y-3 border-l-2 border-gray-200 dark:border-gray-700 pl-4 ml-2">
            {displayHistory.map((history) => {
              const isMint = history.action.toLowerCase().includes('mint');
              const isBurn = history.action.toLowerCase().includes('burn');

              let dotColor = 'bg-gray-400 dark:bg-gray-500';
              let labelColor = 'text-gray-500 dark:text-gray-400';

              if (isMint) {
                dotColor = 'bg-green-500 dark:bg-green-400';
                labelColor = 'text-green-600 dark:text-green-400';
              } else if (isBurn) {
                dotColor = 'bg-red-500 dark:bg-red-400';
                labelColor = 'text-red-600 dark:text-red-400';
              }

              return (
                <div key={history.tx_hash} className="relative pb-4">
                  {/* Timeline dot */}
                  <div
                    className={`absolute w-4 h-4 rounded-full ${dotColor} -left-6 top-0 border-2 border-white dark:border-gray-900`}
                  ></div>

                  {/* Action label */}
                  <div className={`${labelColor} text-sm font-medium mb-1`}>
                    {history.action}
                  </div>

                  {/* Transaction card */}
                  <MiniTransactionCard txHash={history.tx_hash} />
                </div>
              );
            })}
          </div>
        </>
      )}
      {isLoading && <ShimmerBox />}
      {isError && <ErrorBox message={'Could not load token history'} />}
    </>
  );
};

export const PolicyPage = () => {
  const params = useParams();

  const policy = useMemo(() => {
    const unit = params.unit ?? '';
    if (unit === 'lovelace') {
      return '';
    } else {
      return unit;
    }
  }, [params]);

  const policyUrl = useMemo(() => {
    return `${window.location.href}`;
  }, []);

  const { data: assetHistory, isLoading, isError } = useAssetHistory(policy);
  const {
    data: assetTransactions,
    isLoading: isLoadingTransactions,
    isError: isErrorTransactions,
  } = useAssetTransactions(policy);

  return (
    <div className="min-h-screen flex flex-col p-1 gap-5 dark:bg-gray-900">
      <NavBar></NavBar>

      <div className="flex-1 flex flex-col sm:flex-row">
        <main className="flex-1 flex flex-col gap-2 dark:text-white">
          <h2 className="dark:text-white">Policy</h2>

          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500 dark:text-gray-300 font-mono">
              {policy}
            </span>
            <ClipboardButton
              text={policy}
              className="opacity-70 hover:opacity-100 dark:text-white"
            />
            <LinkClipboardButton
              text={policyUrl}
              className="opacity-70 hover:opacity-100 dark:text-white"
            />
          </div>

          <div className="flex flex-col lg:flex-row lg:flex-1 gap-2">
            <div className="flex flex-col lg:w-1/2 gap-2 border-1 border-gray-200 dark:border-gray-700 p-4 dark:text-white">
              <ViewAssetTransactions
                assetTransactions={assetTransactions}
                isLoading={isLoadingTransactions}
                isError={isErrorTransactions}
              />
            </div>
            <div className="flex flex-col lg:w-1/2 gap-2 border-1 border-gray-200 dark:border-gray-700 p-4 dark:text-white">
              <ViewAssetHistory
                assetHistory={assetHistory}
                isLoading={isLoading}
                isError={isError}
              />
            </div>
          </div>
        </main>
        <aside className="order-first md:w-16 lg:w-32"></aside>
        <aside className="md:w-16 lg:w-32"></aside>
      </div>
      <footer className="bg-gray-100 dark:bg-gray-800"></footer>
    </div>
  );
};
